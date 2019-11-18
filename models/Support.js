var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var SupportSchema = new mongoose.Schema({
  query: String,
  answer: String,
  senderEmail: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('support', SupportSchema)
