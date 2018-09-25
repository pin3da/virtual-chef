const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ContestScheme = new Schema(
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

module.exports = mongoose.model('Contest', ContestScheme)
