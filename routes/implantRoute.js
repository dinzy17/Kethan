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
    //console.log('zx', requestParams)
    
    let implantImage = new ImpantImage()
    implantImage.objectName = requestParams.labelName
    implantImage.imgName = req.file.location
    const objectLocation = {
      top: parseInt(requestParams.labelOffsetY),
      left: parseInt(requestParams.labelOffsetX),
      width: parseInt(requestParams.labelWidth),
      height: parseInt(requestParams.labelHeight)
    }
    implantImage.implantManufacture = requestParams.implantManufacture
    implantImage.surgeryDate = requestParams.surgeryDate
    implantImage.surgeryLocation = requestParams.surgeryLocation
    implantImage.removalProcess = requestParams.removalProcess
    implantImage.location = objectLocation    
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

router.post("/analyzeImage", multipartUpload, async function (req, res, next) {
  try {
      const imgS3Path = req.file.location
      console.log(imgS3Path)
      let watsonRes = await watsonLibrary.analyzeImage(constants.watson.collectionID, imgS3Path)
      if(watsonRes.status == "success") {
        res.send(resFormat.rSuccess(watsonRes.data))
      } else {
        res.send(resFormat.rError(messages.common['2']))
      }//end of sending response

  } catch(e) {
    res.send(resFormat.rError(e))
  }
})

//function to get list of user as per given criteria
async function getManufacture (req, res) {
  let query = {
    $group: {
        _id: '$implantManufacture',  //$region is the column name in collection
        count: {$sum: 1}
    }
};
  //query['$or'] = [{'implantManufacture': new RegExp(req.body.manufactureName, 'i')}]
  
  let implantList = await ImpantImage.aggregate([ { "$group" : { _id:"$implantManufacture", "implantManufacture": { "$first": "$implantManufacture" } } } ]);
  if(implantList){
    res.send(resFormat.rSuccess({ implantList }))
  }
  else{
    res.status(401).send(resFormat.rError(err))
  }
}

//function to get list of user as per given criteria
async function getImplantName (req, res) {
  let implantList = await ImpantImage.aggregate([{ "$match": { "implantManufacture": req.body.implantManufacture }},{ "$group" : { _id:"$objectName", 'imgName': { "$first": "$imgName" } ,'objectName': { "$first": "$objectName" } } } ]);
  if(implantList){
    res.send(resFormat.rSuccess({ implantList }))
  }
  else{
    res.status(401).send(resFormat.rError(err))
  }
}

async function getImplantDetail (req, res){
  if(req.body.implantManufacture && req.body.objectName ){
    ImpantImage.findOne({objectName:req.body.objectName, implantManufacture:req.body.implantManufacture }, function(err, implant) {
      if (err) {
        res.status(403).send(resFormat.rError(err))
      } else {
        responceData = {
          "objectName":implant.objectName,
          "implantManufacture":implant.implantManufacture,
          "surgeryDate":implant.surgeryDate,
          'surgeryLocation': implant.surgeryLocation,
          'removalProcess':implant.removalProcess,
          "imgName":implant.imgName,
          "implantId":implant._id
        }
        res.send(resFormat.rSuccess(responceData))
      }
    })
  }
}


router.post("/getManufacture", getManufacture);
router.post("/getImplantName", getImplantName);
router.post("/getImplantDetail", getImplantDetail);

module.exports = router
