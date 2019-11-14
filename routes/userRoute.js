var express = require('express')
var router = express.Router()
var async = require('async')
const { isEmpty } = require('lodash')
const User = require('./../models/User')
const EmailTemplate = require('./../models/EmailTemplate')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const auth = require('./../helpers/authMiddleware');


//function to update user details
function updateProfile(req, res) {
  let params = {
    fullName: req.body.name,
    contactNumber: req.body.contactNumber
  }
  User.update({ _id: req.body.userId },{ $set: params} , function(err, updatedUser) {
      if (err) {
        res.status(403).send(resFormat.rError(err))
      } else {
        responceData = {
          'name':req.body.name,
          'contactNumber':req.body.contactNumber,
          'email':req.body.email,
          'userId':req.body.userId
        }
        res.send(resFormat.rSuccess(responceData))
      }
  })
}

//function to get list of user as per given criteria
async function list (req, res) {
  let { fields, offset, query, order, limit, search } = req.body
  let totalUsers = 0
  if (search && !isEmpty(query)) {
    Object.keys(query).map(function(key, index) {
      if(key !== "status") {
        query[key] = new RegExp(query[key], 'i')
      }
    })
  }

  let userList = await User.find(query, fields);
  if(userList){
    totalUsers = userList.length
    res.send(resFormat.rSuccess({ userList, totalUsers}))
  }
  else{
    res.status(401).send(resFormat.rError(err))
  }
}

//function to get list of user as per given criteria
async function profile (req, res) {
  if (!req.body.userId || req.body.userId == "") {
    res.status(400).send(resFormat.rError("Invalid request"))
  } else {
    User.findOne({_id:req.body.userId}, function(err, user) {
        if (err) {
          res.status(403).send(resFormat.rError(err))
        } else {
          responceData = {
            "name":user.fullName,
            "contactNumber":user.contactNumber,
            "email":user.email,
            "userId":user._id
          }
          res.send(resFormat.rSuccess(responceData))
        }
    })
  }
}

router.post("/updateProfile", auth, updateProfile)
router.post("/list", auth,list)
router.post("/profile", auth, profile)


module.exports = router
