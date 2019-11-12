var express = require('express')
var router = express.Router()
var request = require('request')
const mongoose = require('mongoose')
const { isEmpty } = require('lodash')
const User = require('./../models/User')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')

//function to update user details
function profile(req, res) {
  let params = {
    fullName: req.body.name,
    contactNumber: req.body.contactNumber
  }
  User.update({ _id: req.body._id },{ $set: params} , function(err, updatedUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess({message: 'User details have been updated', data:updatedUser}))
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
  else
    res.status(401).send(resFormat.rError(err))
}

router.post("/profile", profile)
router.post("/list", list)


module.exports = router
