const express = require('express')
const chefAuth = require('../local/chef-auth')
const User = require('../models/users')
const Contest = require('../models/contest')

const router = express.Router()

const codechefEndpoint = 'https://api.codechef.com'

const DuplicatedKeyError = 11000

router.use(chefAuth.assertLoggedIn)

router.get('/', function (req, res) {
  let options = {
    skip: 0,
    limit: 10
  }
  if (req.query.offset) options.skip = parseInt(req.query.offset, 10)
  if (req.query.limit) options.limit = parseInt(req.query.limit, 10)
  Contest.getAll(options, function (err, data) {
    if (err) return res.status(500).json({ error: `failed to retrieve the contests: ${err}` })
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
  Contest.addUser(contestID, req.user._id, startDate, function (err, data) {
    if (err) {
      if (err.code === DuplicatedKeyError) return res.status(500).json({ error: 'user is already registered on this contest' })
      return res.status(500).json({ error: `${err}` })
    }
    res.json(data)
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
