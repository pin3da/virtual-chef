const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Contest = require('./contest').Contest

const User = mongoose.model('User', {
  username: { type: String, index: true },
  contests: [ { type: Schema.Types.ObjectId, ref: 'Contest' } ]
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
    contestData.author = userID
    let contest = new Contest(contestData)
    contest.save(function (err) {
      if (err) return next(err)
      user.contests.push(contest)
      user.save(next)
    })
  })
}

function getContests (userID, next) {
  User.findOne({ _id: userID }).populate('contests').exec(function (err, data) {
    if (err) return next(err)
    next(null, data.contests)
  })
}

module.exports = {
  findOrCreate: findOrCreate,
  addContest: addContest,
  getContests: getContests
}
