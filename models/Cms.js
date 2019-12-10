var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var cmsSchema = new mongoose.Schema({
  id: String,
  pageName: String,
  content: String,
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('cms', cmsSchema)
