const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: String,
  contests: [String]
})

function findOrCreate (username, next) {
  User.findOne({ username: username }, function (err, res) {
    if (err || res == null) {
      let user = new User({ username: username })
      user.save(function (err) {
        if (err) return next(new Error('Can not create user in the db'), null)
        return next(null, user)
      })
    } else {
      next(null, res)
    }
  })
}

module.exports = {
  findOrCreate: findOrCreate
}
