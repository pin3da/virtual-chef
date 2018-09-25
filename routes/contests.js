const express = require('express')
const chefAuth = require('../local/chef-auth')
const User = require('../models/users')
const Contest = require('../models/contest')

const router = express.Router()

const codechefEndpoint = 'https://api.codechef.com'

router.use(chefAuth.assertLoggedIn)

router.get('/create', function (req, res, next) {
  chefAuth.get(codechefEndpoint + '/contests?status=past&limit=10', req, function (err, data) {
    if (err || data.status !== 'OK') return res.status(500).send(err)
    let activeContests = data.result.data.content.contestList
    res.json({ activeContests: activeContests })
  })
})

function getContestInfo (contest, req, next) {
  chefAuth.get(`${codechefEndpoint}/contests/${contest.code}`, req, function (err, body) {
    if (err || body.status !== 'OK') return next(err)
    let contestInfo = body.result.data.content
    contest.timeToEnd = contest.startTime.getTime() + contest.duration - Date.now()
    contest.problemsList = contestInfo.problemsList
    return next(null, contest)
  })
}

function getVirtualSubmissions (contest, req, next) {
  let username = req.user.username
  chefAuth.get(`${codechefEndpoint}/submissions/?username=${username}`, req, function (err, body) {
    if (err || body.status !== 'OK') return next(err)
    let endTime = new Date(contest.startTime.getTime() + contest.duration)
    let data = body.result.data.content.filter(function (sub) {
      let subDate = new Date(sub.date)
      return (subDate >= contest.startTime && subDate <= endTime)
    })
    return next(null, data)
  })
}

function parseSubmissions (username, contest, submissions) {
  let cur = new Array(contest.problemsList.length + 1)
  let ids = {}
  cur[0] = username
  for (let i = 0; i < contest.problemsList.length; i++) {
    ids[contest.problemsList[i].problemCode] = i + 1
    cur[i + 1] = { solved: false, submissions: 0 }
  }

  let total = 0
  for (let i = 0; i < submissions.length; i++) {
    let sub = submissions[i]
    let pid = ids[sub.problemCode]
    if (cur[pid].solved) continue
    cur[pid].submissions++
    if (sub.result === 'AC') {
      total++
      cur[pid].solved = true
      cur[pid].time = parseFloat((new Date(sub.date).getTime() - contest.startTime.getTime()) / 60000).toFixed(2)
    }
  }

  cur.push(total)
  return cur
}

function mergeStandings (contest, virtualSubmissions, username) {
  let result = [parseSubmissions(username, contest, virtualSubmissions)]
  // TODO: compute standings by user
  return result
}

router.get('/:cid', function (req, res, next) {
  Contest.findById(req.params['cid'], function (err, contest) {
    if (err) return res.status(500).send(`Can not get this contest from the db: ${err}`)
    getContestInfo(contest, req, function (err, contestData) { // TODO: save this in the DB to avoid extra call to codechef
      if (err) return res.status(500).send(`Can not get contest info from codechef ${err}`)
      getVirtualSubmissions(contest, req, function (err, submissions) {
        if (err) return res.status(500).send(`Can not get user submissions from codechef ${err}`)
        let finalStandings = mergeStandings(contest, submissions, req.user.username)
        res.json({
          contest: contestData,
          standings: finalStandings
        })
      })
    })
  })
})

router.post('/', function (req, res, next) {
  chefAuth.get(`${codechefEndpoint}/contests/${req.body.contestCode}`, req, function (err, body) {
    if (err) return res.status(500).send(`failed to retrieve info about contest: ${err}`)
    let contestInfo = body.result.data.content
    let start = new Date(contestInfo.startDate).getTime()
    let end = new Date(contestInfo.endDate).getTime()
    let contest = {
      name: contestInfo.name,
      code: contestInfo.code,
      duration: end - start
    }
    User.addContest(req.user._id, contest, function (err) {
      if (err) return res.status(500).send(`failed to add the contest to your user: ${err}`)
      res.json({ status: 'OK' })
    })
  })
})

module.exports = router
