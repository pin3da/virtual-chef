const mongoose = require('mongoose')
const Contest = require('./contest')
const ContestSchema = Contest.schema

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

function addContest (userID, contestData, next) {
  User.findById(userID, function (err, user) {
    if (err) return next(err)
    let contest = new Contest(contestData)
    contest.save(function (err) {
      if (err) return next(err)
      user.contests.push(contest)
      user.save(next)
    })
  })
}

module.exports = {
  findOrCreate: findOrCreate,
  addContest: addContest
}
