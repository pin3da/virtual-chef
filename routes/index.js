var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('sorry, this is ony a backend')
})

module.exports = router
