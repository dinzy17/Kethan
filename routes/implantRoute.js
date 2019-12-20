var express = require('express')
var router = express.Router()
var async = require('async')
var multer  = require('multer')
const auth = require('./../helpers/authMiddleware');
const constants = require('./../config/constants')
const messages = require('./../config/messages')
const resFormat = require('./../helpers/responseFormat')
const s3Upload = require('./../helpers/s3Upload')
const watsonLibrary = require('./../helpers/watsonLibrary')
const User = require('./../models/User')
const sendEmail = require('./../helpers/sendEmail')
const ImpantImage = require('./../models/ImplantImage')
const { isEmpty } = require('lodash')
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
router.post("/addImageToCollection", [ multipartUpload, auth ], async function (req, res, next) {
  try {
      let requestParams = req.body 
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
      implantImage.removImplant = JSON.parse(requestParams.removeImplant);
      implantImage.objectLocation = objectLocation
      implantImage.createdOn = new Date()
  
      if(implantImage.save()){
        let imgS3Path = implantImage.imgName
        let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, implantImage.objectName, implantImage.objectLocation, imgS3Path)
        if (watsonRes.status == "success") {
          let updatedImplant = await ImpantImage.updateOne({
            _id: implantImage._id
          }, {
            $set: { watsonImage_id: watsonRes.data.images[0].image_id }
          })
          if (updatedImplant) {
            res.send(resFormat.rSuccess({image:implantImage, watson:watsonRes}))
          } else {
            res.send(resFormat.rError(messages.watson['1']))
          }
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

router.post("/analyzeImage", [ multipartUpload, auth ], async function (req, res, next) {
  try {
      const imgS3Path = req.file.location
      let watsonRes = await watsonLibrary.analyzeImage(constants.watson.collectionID, imgS3Path)
      if(watsonRes.status == "success") {
        implant = [];
        if(watsonRes.data.images && watsonRes.data.images[0] && watsonRes.data.images[0].objects.collections && watsonRes.data.images[0].objects.collections.length > 0 ) {
          implant = await getImplantDetailByName( watsonRes.data.images[0].objects.collections[0].objects )
          mainObject = watsonRes.data.images[0].objects.collections[0].objects;
          mailBody = 'Hello Admin,<br/>This is result for image search.<br/><br/><h3>Result:</h3><div class="object--container">';
          for (var i = 0; i < mainObject.length; i++){
            mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 200px;">Object name:</b>'+ mainObject[i].object +'</div>'
            mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 200px;">Score:</b>'+ mainObject[i].score +'</div>'
            mailBody = mailBody + '<div style="border: 1px dotted #3f51b5; padding: 15px; min-width: 50%;width: auto;display: inline-block;margin: 10px;">'
            for (var val = 0; val < implant.length; val++){
              mailBody = mailBody + '<div style="margin-bottom: 15px;"><b style="display: inline-block;min-width: 180px;">Manufacturer:</b> '+ implant[val].implantManufacture +'</div>'
              for (var v = 0; v < implant[val].removImplant.length; v++){
                mailBody = mailBody + '<div style="border: 1px solid #cccccc; margin-bottom: 10px;">'
                mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 172px;">Removal Steps:</b>'+ implant[val].removImplant[v].removalProcess +'</div>'
                mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 172px;">Surgery Date:</b>'+ implant[val].removImplant[v].surgeryDate +'</div>'
                mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 172px;">Surgery Location:</b>'+ implant[val].removImplant[v].surgeryLocation +'</div>'
                mailBody = mailBody + '</div>'
              }
              mailBody = mailBody + '</div>'
            }
            mailBody = mailBody + '</div>'
          }
          mailBody = mailBody + '</div>'
          mailBody = mailBody + '<div style="mix-width: 200px"><label style="display: block; margin-top: 20px;"><h3>Image: </h3></label>'
          mailBody = mailBody + '<img style="max-width: 200px; margin: 10px 0 0 20px;" src="'+ watsonRes.data.images[0].source.source_url +'">'
          mailBody = mailBody + '</div>'
          
          console.log('emailBody', mailBody); 
          
          
          const mailOptions = {
            to: "gaurav@arkenea.com",
            subject: "Search result",
            html: mailBody
          }
          sendEmail.sendEmail(mailOptions); 
        }
        res.send(resFormat.rSuccess({wastson:watsonRes.data, implantData: implant }))
      } else {
        res.send(resFormat.rError(messages.common['2']))
      } //end of sending response

  } catch(e) {
    res.send(resFormat.rError(e))
  }
})


async function getImplantDetailByName (objectName) {
  name = [];
  for (var i=0; i < objectName.length; i++) {
    name.push(objectName[i].object);
  }
  let implantList = await ImpantImage.find({objectName:{ $in: name }});
  if(implantList){
    return implantList;
  } else {
    return "no result found"
  }
}

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

async function list (req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status" && key !== "SearchQuery") {
        query[key] = new RegExp(query[key], 'i')
      } else if (key === "SearchQuery") {
        query['$or'] = [{'implantManufacture': new RegExp(query[key], 'i')},{'objectName': new RegExp(query[key], 'i')}]
        delete query.SearchQuery;
      }
    })
  }
  
  let implantList = await ImpantImage.find(query, fields, { sort: order });
  if(implantList){
    totalImplant = implantList.length
    res.send(resFormat.rSuccess({ implantList, totalImplant}))
  }
  else{
    res.status(401).send(resFormat.rError(err))
  }
}

async function listImage (req, res) {
  try {
    let watsonRes = await watsonLibrary.listImages(constants.watson.collectionID)
    if(watsonRes.status == "success") {
      res.send(resFormat.rSuccess(watsonRes))
    } else {
      res.send(resFormat.rError(messages.common['2']))
    }//end of sending response

  } catch(e) {
    res.send(resFormat.rError(e))
  }
}

// function to reset the password
async function implantView (req,res) {
  ImpantImage.findOne({_id: req.body.id}, function(err, details) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ details }))
    }
  })
}






router.post("/getManufacture",auth, getManufacture);
router.post("/getImplantName",auth, getImplantName);
router.post("/getImplantDetail",auth, getImplantDetail);
router.post("/list", auth, list) //, auth
router.post("/implantView", auth,implantView)
router.post("/listImage", auth,listImage)

module.exports = router
