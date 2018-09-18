var request = require('request')

var data = {
  authorizationURL: 'https://api.codechef.com/oauth/authorize',
  tokenURL: 'https://api.codechef.com/oauth/token',
  clientID: '76ffa84f57f0276abcbc5d8ecc246691',
  clientSecret: 'ed3f09a2110901436e901b998494341f',
  callbackURL: 'http://localhost:3000/auth/codechef/callback',
  userProfileURL: 'https://api.codechef.com/users/me'
}

var getCode = function (req, res, next) {
  var state = 'xyz'
  var loginURL = `${data.authorizationURL}?response_type=code&client_id=${data.clientID}&state=${state}&redirect_uri=${data.callbackURL}`
  res.redirect(loginURL)
}

var getToken = function (req, res, next) {
  request.post(
    data.tokenURL,
    {
      json: {
        grant_type: 'authorization_code',
        code: req.query.code,
        client_id: data.clientID,
        client_secret: data.clientSecret,
        redirect_uri: data.callbackURL
      }
    },
    function (err, d, body) {
      if (err) return res.status(500).send('cant get token ):')
      req.session.oauth = body.result.data
      res.redirect('/')
    })
}

function findChefUser (token, next) {
  request.get(
    data.userProfileURL,
    {
      headers: {
        Authorization: `Bearer ${token}`
      },
      json: true
    },
    function (err, d, body) {
      if (err) return next(err, null)
      next(null, body)
    })
}

function sessionHandler (findUser) {
  return function (req, res, next) {
    if (!req.session.oauth || !req.session.oauth.access_token) {
      return next()
    }
    var token = req.session.oauth.access_token
    findChefUser(token, function (err, data) {
      if (err || data.status !== 'OK') res.status(500).send('can get info about user')
      findUser(data.result.data.content.username, function (err, user) {
        if (err) return res.status('500').send(err)
        req.user = user
        next()
      })
    })
  }
}

module.exports = {
  getCode: getCode,
  getToken: getToken,
  sessionHandler: sessionHandler
}
