const express = require('express')
const chefAuth = require('../local/chef-auth')
const User = require('../models/users')

const router = express.Router()

const codechefEndpoint = 'https://api.codechef.com'

router.use(chefAuth.assertLoggedIn)

router.get('/', function (req, res, next) {
  res.send('Coming soon: all your contests here')
})

router.get('/create', function (req, res, next) {
  chefAuth.get(codechefEndpoint + '/contests?status=past&limit=10', req, function (err, data) {
    if (err || data.status !== 'OK') return res.status(500).send(err)
    let activeContests = data.result.data.content.contestList
    res.render('contests/create', { activeContests: activeContests })
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
      duration: end - start,
      startTime: req.body.minutesToStart * 60 * 1000 + Date.now()
    }
    User.addContest(req.user._id, contest, function (err) {
      if (err) return res.status(500).send(`failed to add the contest to your user: ${err}`)
      res.redirect('/')
    })
  })
})

module.exports = router
