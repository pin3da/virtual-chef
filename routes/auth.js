
const router = require('express').Router()
const chefAuth = require('../local/chef-auth')

// auth logout
router.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

// auth login with codechef
router.get('/codechef', chefAuth.getCode)

router.get('/codechef/callback', chefAuth.getToken)

module.exports = router
