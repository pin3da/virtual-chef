var mongoose = require('mongoose')
var Scheme = mongoose.Schema

var ContestScheme = new Scheme(
  {
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('Contest', ContestScheme)
