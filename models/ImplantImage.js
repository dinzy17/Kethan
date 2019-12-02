var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var ImpantImageSchema = new mongoose.Schema({
  objectName: String,
  objCategory: String,
  implantManufacture: String,
  surgeryDate: String,
  surgeryLocation: String,
  removalProcess: String,
  removImplant: Object,
  imgName: String,
  objectLocation: {
    left: Number,
    top: Number,
    width: Number,
    height: Number
  },
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('impantImage', ImpantImageSchema)
