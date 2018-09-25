const express = require('express')
const router = express.Router()
const User = require('../models/users')
const chefAuth = require('../local/chef-auth')

router.use(chefAuth.assertLoggedIn)

router.get('/', function (req, res, next) {
  res.json({ status: 'OK' })
})

router.get('/contests', function (req, res, next) {
  User.getContests(req.user._id, function (err, data) {
    if (err) return res.status(500).json(err)
    res.json({ contests: data })
  })
})

module.exports = router
