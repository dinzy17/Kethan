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
      if (requestParams.addBy !== undefined && requestParams.addBy == "admin") {
        implantImage.isApproved = true
      } else {
        implantImage.isApproved = false
      }
      implantImage.createdOn = new Date()
      implantImage.modifiedOn = new Date()
  
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

// test
router.post("/addImpnatApi", [ multipartUpload, auth ], async function (req, res, next) {
  try {
      let requestParams = req.body 
      let implantImage = new ImpantImage()
      implantImage.objectName = requestParams.labelName
      let objectLocation = {
        top: parseInt(requestParams.labelOffsetY),
        left: parseInt(requestParams.labelOffsetX),
        width: parseInt(requestParams.labelWidth),
        height: parseInt(requestParams.labelHeight)
      }
      let imageData = [{
        imageName: req.file.location,
        objectLocation: objectLocation
      }]
      implantImage.implantManufacture = requestParams.implantManufacture
      implantImage.removImplant = JSON.parse(requestParams.removeImplant);
      implantImage.imageData = imageData
      implantImage.isApproved = false
      implantImage.createdOn = new Date()
      implantImage.modifiedOn = new Date()
      implantImage.save ( async function( err, newImplant ) {
        if (err) {
          res.send(resFormat.rError(e))
        }
        if( newImplant ) {
          res.send(resFormat.rSuccess({ implant : implantImage } ))
        }
      })  //end of implant save 
    } catch(e) {
      res.send(resFormat.rError(e))
    }
})

router.post("/editImageToCollection", [ multipartUpload, auth ], async function (req, res, next) {
  try {
    let requestParams = req.body 
    console.log('sads', requestParams);
    console.log('dfdf', req.file);
    let prams = {};

      
      //let implantImage = new ImpantImage()
      prams.objectName = requestParams.labelName
      if (req.file !== undefined) {
        prams.imgName = req.file.location
        const objectLocation = {
          top: parseInt(requestParams.labelOffsetY),
          left: parseInt(requestParams.labelOffsetX),
          width: parseInt(requestParams.labelWidth),
          height: parseInt(requestParams.labelHeight)
        }
        prams.objectLocation = objectLocation
       deleteFileS3(requestParams.implantId);
      }
      
      prams.implantManufacture = requestParams.implantManufacture
      prams.removImplant = JSON.parse(requestParams.removeImplant);
      //prams.objectLocation = objectLocation
      prams.isApproved = true
      prams.modifiedOn = new Date()
      // for update data.
      let updatedImplant = await ImpantImage.updateOne({
        _id: requestParams.implantId
      }, {
        $set: prams
      })

      if(updatedImplant){
       // res.send(resFormat.rSuccess({mesage:"Implant Update successfully."}))
          ImpantImage.findOne({_id: requestParams.implantId}, async function(err, details) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              // add implant to watson for AI
              deleteImplant(details.watsonImage_id);
              let imgS3Path = details.imgName
              let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, details.objectName, details.objectLocation, imgS3Path)
             // console.log(watsonRes.data);
              if (watsonRes.status == "success") {
                let updatedImplant = await ImpantImage.updateOne({
                  _id: details._id
                }, {
                  $set: { watsonImage_id: watsonRes.data.images[0].image_id }
                })
                if (updatedImplant) {
                  res.send(resFormat.rSuccess({image:details, watson:watsonRes }))
                } else {
                  res.send(resFormat.rError(messages.watson['1']))
                }
              } else {
                res.send(resFormat.rError(messages.watson['1']))
              }
            }
          })
      } else {
        res.send(resFormat.rError(messages.common['2']))
      } 
    } catch(e) {
      res.send(resFormat.rError(e))
    }
})


router.post("/editImplantApi", [ multipartUpload, auth ], async function (req, res, next) {
  try {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.implantId });
      if(implantDetail){
        let updated_data = {}
        if(requestParams.removeImplant !== undefined){
          updated_data.removImplant = JSON.parse(requestParams.removeImplant);
        }
        if (req.file !== undefined) {
          let objectLocation = {
            top: parseInt(requestParams.labelOffsetY),
            left: parseInt(requestParams.labelOffsetX),
            width: parseInt(requestParams.labelWidth),
            height: parseInt(requestParams.labelHeight)
          }
          let imageDataObj = {
            imageName: req.file.location,
            objectLocation: objectLocation
          }
          updated_data.imageData = implantDetail.imageData
          if(implantDetail.imageData.length == 0 || Object.keys(implantDetail.imageData).length == 0 || ( implantDetail.imageData[0] &&  implantDetail.imageData[0] == {} )) {
            updated_data.imageData = []
          }
          if(!updated_data.imageData[0].imageName || updated_data.imageData[0].imageName == "") {
            updated_data.imageData.splice(0, 1)
          }
          updated_data.imageData.push(imageDataObj)
        }
        
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          res.send(resFormat.rSuccess({ implant : implantUpdated }))
         } else {
           res.send(resFormat.rError())
         }
      }
    } catch(e) {
      res.send(resFormat.rError(e))
    }
})

// test implant
router.post("/editImageToCollectionTest", [ multipartUpload, auth ], async function (req, res, next) {
  try {
    let requestParams = req.body 
    console.log('sads', requestParams);
    console.log('dfdf', req.file);
    let prams = {};

      
      //let implantImage = new ImpantImage()
      prams.objectName = requestParams.labelName
      if (req.file !== undefined) {
        prams.imgName = req.file.location
        const objectLocation = {
          top: parseInt(requestParams.labelOffsetY),
          left: parseInt(requestParams.labelOffsetX),
          width: parseInt(requestParams.labelWidth),
          height: parseInt(requestParams.labelHeight)
        }
        prams.objectLocation = objectLocation
       //deleteFileS3(requestParams.implantId);
      }
      
      prams.implantManufacture = requestParams.implantManufacture
      prams.removImplant = JSON.parse(requestParams.removeImplant);
      //prams.objectLocation = objectLocation
      prams.isApproved = true
      prams.modifiedOn = new Date()
      // for update data.
      let updatedImplant = await ImpantImage.updateOne({
        _id: requestParams.implantId
      }, {
        $set: prams
      })

      if(updatedImplant){
       // res.send(resFormat.rSuccess({mesage:"Implant Update successfully."}))
          ImpantImage.findOne({_id: requestParams.implantId}, async function(err, details) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              // add implant to watson for AI
              //deleteImplant(details.watsonImage_id);
              let imgS3Path = details.imgName
              let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, details.objectName, details.objectLocation, imgS3Path)
             // console.log(watsonRes.data);
              if (watsonRes.status == "success") {
                let updatedImplant = await ImpantImage.updateOne({
                  _id: details._id
                }, {
                  $set: { watsonImage_id: watsonRes.data.images[0].image_id }
                })
                if (updatedImplant) {
                  res.send(resFormat.rSuccess({image:details, watson:watsonRes }))
                } else {
                  res.send(resFormat.rError(messages.watson['1']))
                }
              } else {
                res.send(resFormat.rError(messages.watson['1']))
              }
            }
          })
      } else {
        res.send(resFormat.rError(messages.common['2']))
      } 
    } catch(e) {
      res.send(resFormat.rError(e))
    }
})

function deleteImplant(id) {
  let watsonDelete = watsonLibrary.deleteImage((constants.watson.collectionID, id))
}

function deleteFileS3(id){
  ImpantImage.findOne({ _id: id }, function(err, implant) {
    if (err) {
      res.send(resFormat.rError(err))
    }else{
      if(implant.imgName !=""){
        AWS.config.update({
          accessKeyId: constants.awsS3.accessKey,
          secretAccessKey: constants.awsS3.secretAccessKey,
          region: 'us-east-1',
        });
          const s3 = new AWS.S3();
          const params = {
            Bucket: constants.awsS3.bucket,
            Key: implant.imgName
          }
        s3.deleteObject(params).promise()
        console.log('image delete');
      }
    }
  })
}


router.post("/addImplantUser", [ multipartUpload, auth ], async function (req, res, next) {
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
      implantImage.isApproved = false
      implantImage.createdOn = new Date()
      implantImage.save(async function(err, newImplant) {
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess({message:"Save implant successfully."}))
        }
      })
      //end of implant save 
    } catch(e) {
      res.send(resFormat.rError(e))
    }
})

// function approve implant by admin
async function implantApproved (req,res) {
  ImpantImage.findOne({_id: req.body.id}, async function(err, details) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      // add implant to watson for AI
      let imgS3Path = details.imgName
      let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, details.objectName, details.objectLocation, imgS3Path)
      if (watsonRes.status == "success") {
        let updatedImplant = await ImpantImage.updateOne({
          _id: details._id
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
      }
    }
  })
}

// Implant rejected.

async function implantRejected (req,res) {
  ImpantImage.findOne({_id: req.body.id}, async function(err, details) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      let updatedImplant = await ImpantImage.updateOne({
          _id: details._id
        }, {
          $set: { isRejected: true }
        })
        if (updatedImplant) {
          res.send(resFormat.rSuccess({ message:'Implant successfully rejected' }))
        } else {
          res.send(resFormat.rError(messages.watson['1']))
        }
    }
  })
}



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
    console.log('implant body',req.body )
    console.log('implant body',req.file )
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
                let surgeryDateFormate = ""
               // if(implant[val].removImplant[v].surgeryDate != undefined && implant[val].removImplant[v].surgeryDate !=""){
                let current_datetime = new Date(implant[val].removImplant[v].surgeryDate)
                 surgeryDateFormate = (current_datetime.getMonth() + 1) + "/" + current_datetime.getDate() + "/" + current_datetime.getFullYear()
               // }
                mailBody = mailBody + '<div style="border: 1px solid #cccccc; margin-bottom: 10px;">'
                mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 172px;">Removal Steps:</b>'+ implant[val].removImplant[v].removalProcess +'</div>'
                mailBody = mailBody + '<div style="margin: 10px;"><b style="display: inline-block;min-width: 172px;">Surgery Date:</b>'+ surgeryDateFormate +'</div>'
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
          // send email in admin
          const mailOptions = {
            to: "gaurav@arkenea.com",
            subject: "Search result",
            html: mailBody
          }
          sendEmail.sendEmail(mailOptions); 
          implantRep = { status:"success", implant:implant }
        } else {
          implantRep = { status:"error", implant:implant }
        }
        
        res.send(resFormat.rSuccess({ wastson:watsonRes.data, implantData: implant, implantApi:implantRep }))
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
    res.send(resFormat.rError(err))
  }
}

//function to get list of user as per given criteria
async function getImplantName (req, res) {
  let implantList = await ImpantImage.aggregate([{ "$match": { "implantManufacture": req.body.implantManufacture }},{ "$group" : { _id:"$objectName", 'imgName': { "$first": "$imgName" } ,'objectName': { "$first": "$objectName" } } } ]);
  if(implantList){
    res.send(resFormat.rSuccess({ implantList }))
  }
  else{
    res.send(resFormat.rError(err))
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
  //query['isApproved'] = true
  //query['isRejected'] = false
  //console.log(query);  
  let implantList = await ImpantImage.find(query, fields, { sort: order });
  if(implantList){
    totalImplant = implantList.length
    res.send(resFormat.rSuccess({ implantList, totalImplant}))
  }
  else{
    res.status(401).send(resFormat.rError(err))
  }
}

// update Implant list
async function updateList (req, res) {
  
  let implantList = await ImpantImage.find({});
  if(implantList){
    for (var i=0; i<implantList.length; i++) {
      updateImplant(implantList[i]._id, implantList[i].createdOn)
    }
  }
  else{
    res.send(resFormat.rError(err))
  }
  async function updateImplant(id, date){
    let updatedImplant = await ImpantImage.updateOne({
      _id: id
    }, {
      $set: { modifiedOn: date }
    })
  }
}



// list unverify implant.
async function unVerifyList (req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status" && key !== "SearchQuery") {
        query[key] = new RegExp(query[key], 'i')
      } else if (key === "SearchQuery") {
        // query['$or'] = [{'implantManufacture': new RegExp(query[key], 'i')},{'objectName': new RegExp(query[key], 'i')}]
        query['implantManufacture'] = new RegExp(query[key], 'i')
        query['objectName'] = new RegExp(query[key], 'i')
        delete query.SearchQuery;
      }
      query['isApproved'] = false
      query['isRejected'] = false
    })
  }
  
  let implantList = await ImpantImage.find(query, fields, { sort: order });
  if(implantList){
    totalImplant = implantList.length
    res.send(resFormat.rSuccess({ implantList, totalImplant}))
  }
  else{
    res.send(resFormat.rError(err))
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

// function to implant view
async function implantView (req,res) {
  ImpantImage.findOne({_id: req.body.id}, function(err, details) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ details }))
    }
  })
}

async function getTotalManufactureName( req,res ){
  let implantList = await ImpantImage.find();
  if(implantList){
    let manufactureName = []
    let brandName = []
    for (let i= 0; i < implantList.length; i++){
      manufactureName[i] = implantList[i].implantManufacture 
      manufactureName.push(implantList[i].implantManufacture);
      brandName.push(implantList[i].objectName );
    }
    res.send(resFormat.rSuccess({ manufecture : manufactureName, brandName : brandName }))
  } else {
    res.send(resFormat.rError())
  }
}

async function searchByText( req,res ) {
  query = {}
  if((req.body.manufecture && req.body.manufecture !="") || (req.body.brandName && req.body.brandName !="")){
    if(req.body.manufecture && req.body.manufecture !=""){
      query['implantManufacture'] = req.body.manufecture
    }
    if(req.body.brandName && req.body.brandName !="") {
      query['objectName'] = req.body.brandName
    }
    let implantList = await ImpantImage.find(query);
    if(implantList.length > 0 ){
      let implantListObj = []
      for (let i= 0; i < implantList.length; i++){
        implantListObj.push (implantList[i])
      }
      res.send(resFormat.rSuccess({ implant:implantListObj }))
    } else {
      res.send(resFormat.rSuccess({ message:'No Result found.' }))  
    }
  } else {
    res.send(resFormat.rError({message: "Enter either manufacture or either brand/name." }))
  }
}

async function searchByArray( req,res ) {
  // ImpantImage.findOne({'imageData.imageName': "https://staging-sid.s3.amazonaws.com/implantPicture1577704040940.png" }, function (err, user) {
  //   if (err){
  //       return done(err);
  //   }    
  //   if (user) {
  //       console.log("ROOM NAME FOUND");
  //       res.send(resFormat.rSuccess({ message: user }))  
  //     }
  // });

  ImpantImage.findOneAndUpdate({'imageData.imageName': "https://staging-sid.s3.amazonaws.com/implantPicture1577710091978.png" },
  {"$set": {
        "imageData.$.watsonImage_id": "wxyz"
    }}, function(err, users) { 
  if(err) {
    res.send(resFormat.rError(err))
  } 
  if (users) {
    res.send(resFormat.rSuccess({ message: users }))  
  }
});
}


router.post("/getManufacture",auth, getManufacture);
router.post("/getImplantName",auth, getImplantName);
router.post("/getImplantDetail",auth, getImplantDetail);
router.post("/list", auth, list) //, auth
router.post("/implantView", implantView) //,auth
router.post("/listImage",listImage) //, auth
router.post("/getTotalManufactureName", getTotalManufactureName)
router.post("/searchByText", searchByText)
router.post("/updateList", updateList)
router.post("/searchByArray", searchByArray)
module.exports = router
