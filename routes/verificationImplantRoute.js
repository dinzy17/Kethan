var express = require('express')
var router = express.Router()
var async = require('async')
const { isEmpty } = require('lodash')
var constants = require('./../config/constants')
const watsonLibrary = require('./../helpers/watsonLibrary')
const resFormat = require('./../helpers/responseFormat')
const ImpantImage = require('./../models/ImplantImage')
const mongoose = require('mongoose')

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
    query['$or'] = [{ 'removImplant.isApproved': false },{ 'imageData.isApproved':false }]
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
        updated_data.isNewImplant = false
        updated_data.approvedDate = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.imageData.length; i++) {
            await saveImplantWatson(implantDetail.objectName, implantDetail.imageData[i].imageName, implantDetail.imageData[i].objectLocation);
          }
          // save true
          for (let i = 0; i < implantDetail.removImplant.length; i++) {
            await saveImplantProcess( implantDetail.removImplant[i].id, "approved" );
          }

          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function partialApproveImage (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.implantId });
      if(implantDetail){
        let updated_data = {}
        let imageDataObj = {}
        updated_data.modifiedOn = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.imageData.length; i++) {
            if( implantDetail.imageData[i].id == requestParams.id ) {
              await saveImplantWatson(implantDetail.objectName, implantDetail.imageData[i].imageName, implantDetail.imageData[i].objectLocation);
            }
          }
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function saveImplantWatson( name, imagePath, objectLocation ){
    let watsonRes = await watsonLibrary.addImage(constants.watson.collectionID, name, objectLocation, imagePath);
      if (watsonRes.status == "success") {
        ImpantImage.findOneAndUpdate({'imageData.imageName': imagePath },
        {"$set": {
              "imageData.$.watsonImage_id": watsonRes.data.images[0].image_id,
              "imageData.$.isApproved": true,
              "imageData.$.verifyDate": new Date()
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

    async function saveImplantReject( imagePath ){
        ImpantImage.findOneAndUpdate({'imageData.imageName': imagePath },
          {"$set": {
                "imageData.$.isRejected": true,
                "imageData.$.verifyDate": new Date()
            }}, function(err, usersImplant) { 
          if(err) {
            return "error";
          } 
          if (usersImplant) {
            return "success";
          }
        });
        
      }
  

  async function rejectImplant (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.id });
      if(implantDetail){
        let updated_data = {}
        updated_data.modifiedOn = new Date()
        updated_data.isRejected = true
        updated_data.isNewImplant = false
        updated_data.rejectedDate = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  // reject implant 

  async function partialRejectImage (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.implantId });
      if(implantDetail){
        let updated_data = {}
        let imageDataObj = {}
        updated_data.modifiedOn = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.imageData.length; i++) {
            if( implantDetail.imageData[i].id == requestParams.id ) {
              await saveImplantReject(implantDetail.imageData[i].imageName);
            }
          }
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function partialApproveRemovalProcess (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.implantId });
      if(implantDetail){
        let updated_data = {}
        updated_data.modifiedOn = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.removImplant.length; i++) {
            if( implantDetail.removImplant[i].id == requestParams.id ) {
              await saveImplantProcess(implantDetail.removImplant[i].id, 'approved');
            }
          }
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function partialRejectRemovalProcess (req, res) {
    let requestParams = req.body 
    let prams = {};
    let implantDetail = await ImpantImage.findOne({ "_id": requestParams.implantId });
      if(implantDetail){
        let updated_data = {}
        updated_data.modifiedOn = new Date()
        let updateImplant = await ImpantImage.findOneAndUpdate({ _id: implantDetail._id }, updated_data)
         if( updateImplant ) {
          let implantUpdated = await ImpantImage.findOne({ "_id": implantDetail._id });
          // send image in watson.
          for (let i = 0; i < implantDetail.removImplant.length; i++) {
            if( implantDetail.removImplant[i].id == requestParams.id ) {
              await saveImplantProcess( implantDetail.removImplant[i].id, 'rejected');
            }
          }
          res.send(resFormat.rSuccess())
        } else {
          res.send(resFormat.rError())
        }
      }
  }

  async function saveImplantProcess(id, action ){
    if(action == "approved") {
    let img = await  ImpantImage.findOne({'removImplant.id':id })
      console.log(img)
      ImpantImage.findOneAndUpdate( {'removImplant.id':id },
      {"$set": {
            "removImplant.$.isApproved": true,
            "removImplant.$.verifyDate": new Date()
        }}, function(err, usersImplant) { 
      if(err) {
        return "error";
      } 
      if (usersImplant) {
        return "success";
      }
    }); 
    } else {
      ImpantImage.findOneAndUpdate({'removImplant.id': id},
      {"$set": {
            "removImplant.$.isRejected": true,
            "removImplant.$.verifyDate": new Date()
        }}, function(err, usersImplant) { 
      if(err) {
        return "error";
      } 
      if (usersImplant) {
        return "success";
      }
    });
    }
  }

router.post("/partialApproveImage", partialApproveImage)
router.post("/approveImplant", approveImplant)
router.post("/rejectImplant", rejectImplant)
router.post("/list", list)
router.post("/partialRejectImage", partialRejectImage)
router.post("/partialApproveRemovalProcess", partialApproveRemovalProcess)
router.post("/partialRejectRemovalProcess", partialRejectRemovalProcess)

module.exports = router
