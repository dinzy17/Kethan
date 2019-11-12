var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('faq', faqSchema)
