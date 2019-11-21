var express = require('express')
var router = express.Router()
var async = require('async')
var multer  = require('multer')

const constants = require('./../config/constants')
const messages = require('./../config/messages')
const resFormat = require('./../helpers/responseFormat')
const s3Upload = require('./../helpers/s3Upload')
const watsonLibrary = require('./../helpers/watsonLibrary')
const User = require('./../models/User')
const ImpantImage = require('./../models/ImplantImage')

const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
    accessKeyId: constants.awsS3.accessKey,
    secretAccessKey: constants.awsS3.secretAccessKey
})

var multipartUpload = multer({storage: multerS3({
    s3: s3,
    bucket: constants.awsS3.bucket,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, file.fieldname + Date.now().toString() + ".png" )
    }
  })
}).single('implantPicture')

//function to test
router.post("/addImageToCollection", multipartUpload, async function (req, res, next) {
  try {
    let requestParams = req.body
    let implantImage = new ImpantImage()
    implantImage.objectName = requestParams.labelName
    implantImage.imgName = req.file.location
    implantImage.location = {
      top: requestParams.labelOffsetY,
      left: requestParams.labelOffsetX,
      width: requestParams.labelWidth,
      height: requestParams.labelHeight
    }
    implantImage.createdOn = new Date()

    if(implantImage.save()){
      let imgS3Path = implantImage.imgName
      let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, implantImage.objectName, implantImage.location, imgS3Path)
      // console.log("watsonRes", watsonRes)
      if(watsonRes.status == "success") {
        // let watsonTrainingRes = await watsonLibrary.trainCollection(constants.watson.collectionID)
        // console.log("watsonTrainingRes=>", watsonTrainingRes.data.training_status)
        res.send(resFormat.rSuccess(implantImage))
      } else {
        res.send(resFormat.rError(messages.watson['1']))
      }//end of sending response
    } else {
      res.send(resFormat.rError(messages.common['2']))
    } //end of implant save
  } catch(e) {
    res.send(resFormat.rError(e))
  }
})

router.post("/getCollectionStatus", async function (req, res) {
  try {
      let watsonRes = await watsonLibrary.listCollection()
      console.log(watsonRes.data.collections)
      if(watsonRes.status == "success") {
        res.send(resFormat.rSuccess(watsonRes.data.collections[0].training_status.objects))
      } else {
        res.send(resFormat.rError(messages.common['2']))
      }//end of sending response

  } catch(e) {
    res.send(resFormat.rError(e))
  }
})

router.post("/startCollectionTraining", async function (req, res) {
  try {
      let watsonRes = await watsonLibrary.trainCollection(constants.watson.collectionID)
      if(watsonRes.status == "success") {
        res.send(resFormat.rSuccess(watsonRes.data.training_status.objects))
      } else {
        res.send(resFormat.rError(messages.common['2']))
      }//end of sending response

  } catch(e) {
    res.send(resFormat.rError(e))
  }
})



module.exports = router
