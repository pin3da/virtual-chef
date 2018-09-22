const express = require('express')
const router = express.Router()
const User = require('../models/users')
const chefAuth = require('../local/chef-auth')

router.use(chefAuth.assertLoggedIn)

router.get('/', function (req, res, next) {
  res.json({ status: 'OK' })
})

router.get('/contests', function (req, res, next) {
  res.json({ contests: req.user.contests })
})

module.exports = router
