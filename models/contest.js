const mongoose = require('mongoose')
const async = require('async')
const Schema = mongoose.Schema
const ObjectID = mongoose.Types.ObjectId

const RegistrantSchema = new Schema(
  {
    contestID: { type: Schema.Types.ObjectId, ref: 'Contests', required: true },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true }
  }
)

RegistrantSchema.index({ contestID: 1, userID: 1 }, { unique: true })

const Registrant = mongoose.model('Registrant', RegistrantSchema)

Registrant.ensureIndexes()

const ContestScheme = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    duration: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    registrants: [ { type: Schema.Types.ObjectId, ref: 'Registrant' } ],
    problemsList: [{ type: String }]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

const Contest = mongoose.model('Contest', ContestScheme)

function getAll (options, next) {
  options.sort = { created_at: -1 }

  async.parallel({
    contests: function (callback) {
      Contest.find({}, null, options).populate('author', 'username').exec(function (err, contests) {
        if (err) return callback(err)
        callback(null, contests)
      })
    },
    numContests: function (callback) {
      Contest.estimatedDocumentCount().exec(function (err, numContests) {
        if (err) return callback(err)
        callback(null, numContests)
      })
    }
  }, function (err, results) {
    if (err) return next(err)
    next(null, results)
  })
}

function registerUser (contestID, userID, startDate, next) {
  contestID = new ObjectID(contestID)
  Contest.findById(contestID, function (err, contest) {
    if (err) return next(err)
    const registrant = new Registrant({
      userID: userID,
      contestID: contestID,
      startDate: startDate
    })

    registrant.save(function (err, regData) {
      if (err) return next(err)
      contest.registrants.push(regData)
      contest.save(function (err, contData) {
        if (err) return next(err)
        next(null, contData)
      })
    })
  })
}

function get (contestID, next) {
  Contest
    .findOne({ _id: contestID })
    .populate({
      path: 'registrants',
      populate: {
        path: 'userID'
      }
    })
    .exec(function (err, contest) {
      if (err) return next(err)
      return next(null, contest)
    })
}

module.exports = {
  Contest: Contest,
  Registrant: Registrant,
  getAll: getAll,
  registerUser: registerUser,
  get: get
}
