var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var SupportSchema = new mongoose.Schema({
  query: String,
  replay: String,
  senderEmail: String,
  sendReplay: Boolean,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('support', SupportSchema)
