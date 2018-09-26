const express = require('express')
const async = require('async')

const chefAuth = require('../local/chef-auth')
const User = require('../models/users')
const Contest = require('../models/contest')

const router = express.Router()

const codechefEndpoint = 'https://api.codechef.com'

const DuplicatedKeyError = 11000

router.use(chefAuth.assertLoggedIn)

router.get('/:cid', function (req, res) {
  const contestID = req.params['cid']
  Contest.get(contestID, function (err, contest) {
    if (err) return res.status(500).json({ error: 'can not get this contest from the DB' })
    res.json(contest)
  })
})

router.get('/', function (req, res) {
  let options = {
    skip: 0,
    limit: 10
  }
  if (req.query.offset) options.skip = parseInt(req.query.offset, 10)
  if (req.query.limit) options.limit = parseInt(req.query.limit, 10)
  Contest.getAll(options, function (err, data) {
    if (err) return res.status(500).json({ error: `failed to retrieve the contests: ${err}` })
    data.registeredContests = req.user.registeredContests
    res.json(data)
  })
})

router.post('/:cid/register', function (req, res) {
  const contestID = req.body.contestID
  let startDate = new Date()
  if (req.body.minutesBeforeStart) {
    const delayMilliseconds = req.body.minutesBeforeStart * 60 * 1000
    startDate = new Date(Date.now() + delayMilliseconds)
  }
  async.parallel([
    function (callback) {
      Contest.registerUser(contestID, req.user._id, startDate, function (err, data) {
        if (err) {
          const msg = 'user is already registered on this contest'
          if (err.code === DuplicatedKeyError) return callback(msg)
          return callback(err)
        }
        callback(null, data)
      })
    },
    function (callback) {
      User.addRegisteredContest(req.user._id, contestID, function (err) {
        if (err) return callback(err)
        callback(null)
      })
    }
  ],
  function (err, results) {
    if (err) return res.status(500).json({ error: err })
    res.json(results[0])
  })
})

router.post('/', function (req, res) {
  chefAuth.get(`${codechefEndpoint}/contests/${req.body.contestCode}`, req, function (err, body) {
    if (err) return res.status(500).send(`failed to retrieve info about contest`)
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
