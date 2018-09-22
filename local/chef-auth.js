const request = require('request')

const data = {
  authorizationURL: 'https://api.codechef.com/oauth/authorize',
  tokenURL: 'https://api.codechef.com/oauth/token',
  clientID: '1e0d3b472d830433964cf30e033bc46d',
  clientSecret: 'f7f700a2f031d4eb4b33ceecf3e5f31c',
  callbackURL: 'http://localhost:3000/auth/codechef/callback',
  userProfileURL: 'https://api.codechef.com/users/me'
}

function setTokens (req, res, next) {
  req.session.oauth = req.body
  req.session.oauth.expire_time = Date.now() + req.session.oauth.expires_in * 1000
  res.json(req.body)
}

function getCode (req, res, next) {
  const state = 'xyz'
  const loginURL = `${data.authorizationURL}?response_type=code&client_id=${data.clientID}&state=${state}&redirect_uri=${data.callbackURL}`
  res.redirect(loginURL)
}

function getToken (req, res, next) {
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
      // compute the expire time in milliseconds from the param "expires in" of codechef
      req.session.oauth.expire_time = Date.now() + req.session.oauth.expires_in * 1000
      res.redirect('/')
    })
}

function findChefUser (token, next) {
  request.get(data.userProfileURL, {
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
    const token = req.session.oauth.access_token
    findChefUser(token, function (err, data) {
      if (err || data.status !== 'OK') return res.status(500).send(data)
      if (data.errors) return res.status(500).send(data.errors)
      findUser(data.result.data.content.username, function (err, user) {
        if (err) return res.status('500').send(err)
        req.user = user
        next()
      })
    })
  }
}

function refreshToken (req, next) {
  if (req.session.oauth.expire_time <= Date.now()) {
    request.post(
      data.tokenURL,
      {
        json: {
          grant_type: 'refresh_token',
          refresh_token: req.session.oauth.refresh_token,
          client_id: data.clientID,
          client_secret: data.clientSecret
        }
      },
      function (err, d, body) {
        if (err) return next(err)
        req.session.oauth = body.result.data
        // compute the expire time in milliseconds from the param "expires in" of codechef
        req.session.oauth.expire_time = Date.now() + req.session.oauth.expires_in * 1000
        next()
      }
    )
  } else {
    next()
  }
}

/**
 * Callback for authorized get
 *
 * @callback getCallback
 * @param {Error} err - error if query does not succeed
 * @param {Object} body - response of query
 */

/**
 * Performs a get requiest with proper authorization
 * @param {String} url - URL to request from
 * @param {Object} req - request object from the original petition
 * @param {getCallback} next - callback
 */

function get (url, req, next) {
  refreshToken(req, function (err) {
    if (err) return next(err)
    request.get(url, {
      headers: {
        Authorization: `Bearer ${req.session.oauth.access_token}`
      },
      json: true
    },
    function (err, d, body) {
      if (err) return next(err)
      return next(null, body)
    })
  })
}

function assertLoggedIn (req, res, next) {
  if (!req.session || !req.session.oauth) {
    return res.status(401).json({ error: 'plase log in' })
  }
  next()
}

module.exports = {
  assertLoggedIn: assertLoggedIn,
  setTokens: setTokens,
  sessionHandler: sessionHandler,
  get: get,
  getCode: getCode,
  getToken: getToken
}
