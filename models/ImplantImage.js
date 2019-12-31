var mongoose = require( 'mongoose' )
var constants = require("./../config/constants")

var ImpantImageSchema = new mongoose.Schema({
  objectName: String,
  objCategory: String,
  implantManufacture: String,
  surgeryDate: String,
  surgeryLocation: String,
  removalProcess: String,
  removImplant: Array,
  imgName: String,
  objectLocation: {
    left: Number,
    top: Number,
    width: Number,
    height: Number
  },
  imageData: Array,
  watsonImage_id: String,
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  createdOn: Date,
  modifiedOn: Date
})

module.exports = mongoose.model('impantImage', ImpantImageSchema)
