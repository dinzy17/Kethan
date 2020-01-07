var express = require('express')
var router = express.Router()
var async = require('async')
const { isEmpty } = require('lodash')
var constants = require('./../config/constants')
const watsonLibrary = require('./../helpers/watsonLibrary')
const resFormat = require('./../helpers/responseFormat')
const ImpantImage = require('./../models/ImplantImage')

//function to get list of user as per given criteria
async function list (req, res) {
    let { fields, offset, query, order, limit, search } = req.body
    let totalUsers = 0
    if (search && !isEmpty(query)) {
      Object.keys(query).map(function(key, index) {
        if(key !== "status" && key !== "SearchQuery") {
          query[key] = new RegExp(query[key], 'i')
        } else if (key === "SearchQuery") {
           query['$or'] = [{'implantManufacture': new RegExp(query[key], 'i')},{'objectName': new RegExp(query[key], 'i')},{ 'removImplant.isApproved': false },{ 'imageData.isApproved':false },{ 'isApproved':false } ]
           delete query.SearchQuery;
        } else {
           query['$or'] = [{ 'removImplant.isApproved': false },{ 'imageData.isApproved':false }, { 'isApproved':false }]
        }
      })
    }
    query['$or'] = [{ 'removImplant.isApproved': false },{ 'imageData.isApproved':false }, { 'isApproved':false }]
    let implantList = await ImpantImage.find(query, fields, { sort: order });
    if(implantList){
      totalImplant = implantList.length
      res.send(resFormat.rSuccess({ implantList, totalImplant}))
    }
    else{
      res.send(resFormat.rError(err))
    }
  }

  
  async function approveImplant (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.id });
      if(implantDetail){
        let updated_data = {}
        let imageDataObj = {}
        updated_data.modifiedOn = new Date()
        updated_data.isApproved = true
        updated_data.approvedDate = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.imageData.length; i++) {
            await saveImplantWatson(implantDetail.objectName, implantDetail.imageData[i].imageName, implantDetail.imageData[i].objectLocation);
          }
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function saveImplantWatson( name, imagePath, objectLocation ){
    let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, name, objectLocation, imagePath);
    console.log('watsonRes.status', watsonRes.status);
    console.log('watsonRes', watsonRes.data.images[0].errors)
      if (watsonRes.status == "success") {
        ImpantImage.findOneAndUpdate({'imageData.imageName': imagePath },
        {"$set": {
              "imageData.$.watsonImage_id": watsonRes.data.images[0].image_id,
              "imageData.$.isApproved": true,
          }}, function(err, usersImplant) { 
        if(err) {
          return "error";
        } 
        if (usersImplant) {
          return "success";
        }
      });
      } else {
        return "error";
      }
    }
  

  async function rejectImplant (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.id });
      if(implantDetail){
        let updated_data = {}
        updated_data.modifiedOn = new Date()
        updated_data.isRejected = true
        updated_data.rejectedDate = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

router.post("/approveImplant", approveImplant)
router.post("/rejectImplant", rejectImplant)
router.post("/list", list)


module.exports = router
