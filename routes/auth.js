
const router = require('express').Router()
const chefAuth = require('../local/chef-auth')

// auth logout
router.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/')
})

router.post('/login', chefAuth.setTokens)

module.exports = router
