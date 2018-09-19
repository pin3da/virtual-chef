const express = require('express')
const chefAuth = require('../local/chef-auth')
const router = express.Router()

const codechefEndpoint = 'https://api.codechef.com'

router.get('/', chefAuth.assertLoggedIn, function (req, res, next) {
  res.send('Coming soon: all your contests here')
})

router.get('/create', chefAuth.assertLoggedIn, function (req, res, next) {
  chefAuth.get(codechefEndpoint + '/contests?status=past&limit=10', req, function (err, data) {
    if (err || data.status !== 'OK') return res.status(500).send(err)
    let activeContests = data.result.data.content.contestList
    res.render('contests/create', { activeContests: activeContests })
  })
})

module.exports = router
