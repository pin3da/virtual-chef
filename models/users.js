const mongoose = require('mongoose')
const ContestSchema = require('./contest').schema

const User = mongoose.model('User', {
  username: { type: String, index: true },
  contests: [ContestSchema]
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

function addContest (username, contestID, next) {
  next(null)
}

module.exports = {
  findOrCreate: findOrCreate,
  addContest: addContest
}
