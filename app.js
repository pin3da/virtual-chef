var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var logger = require('morgan')
var mongoose = require('mongoose')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var authRouter = require('./routes/auth')

var chefAuth = require('./local/chef-auth')
var User = require('./models/users')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cookieSession({
  maxAge: 60 * 60 * 1000,
  keys: ['asdkjhfasdlfkjhasdlkjfh314rfasdc324fascasdqdc']
}))
app.use(express.static(path.join(__dirname, 'public')))

// Keeps relation between cookies and oauth users
app.use(chefAuth.sessionHandler(User.findOrCreate))

// Mongodb
mongoose.connect('mongodb://chef123:chef123@ds259912.mlab.com:59912/chef', { useNewUrlParser: true })

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)

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
  res.render('error')
})

module.exports = app
