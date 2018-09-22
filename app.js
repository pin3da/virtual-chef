var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var logger = require('morgan')
var mongoose = require('mongoose')

var chefAuth = require('./local/chef-auth')
var User = require('./models/users')

var app = express()

// enable cors
app.use(function(req, res, next) {
  // TODO: fix cors in production
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cookieSession({
  maxAge: 60 * 60 * 1000,
  keys: ['asdkjhfasdlfkjhasdlkjfh314rfasdc324fascasdqdc']
}))

// Keeps relation between cookies and oauth users
app.use(chefAuth.sessionHandler(User.findOrCreate))

// Mongodb
mongoose.connect('mongodb://chef123:chef123@ds259912.mlab.com:59912/chef', { useNewUrlParser: true })

app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/auth', require('./routes/auth'))
app.use('/contest', require('./routes/contests'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send('error')
})

module.exports = app
