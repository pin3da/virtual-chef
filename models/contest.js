const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ContestScheme = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    duration: { type: Number, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    registrants: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
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
  Contest.find({}, null, options).populate('author', 'username').exec(function (err, contests) {
    if (err) return next(err)
    next(null, contests)
  })
}

module.exports = {
  Contest: Contest,
  getAll: getAll,
}
