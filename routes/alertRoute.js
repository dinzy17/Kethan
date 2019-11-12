var express = require('express')
var router = express.Router()
var passport = require('passport')
var request = require('request')
var jwt = require('express-jwt')
const mongoose = require('mongoose')
var _ = require('lodash');
var async = require('async')
var fs = require('fs')
const {
    isEmpty
} = require('lodash')
const Busboy = require('busboy')
const resFormat = require('./../helpers/responseFormat')
const House = require('./../models/House')
const Community = require('./../models/Community')
const User = require('./../models/User')
const jwtHelper = require('../helpers/jwtHelper');
var PN = require('../helpers/pushNotification');
var message = require('./../config/messages')

//function to create or register new user
async function create(req, res) {
    user = await User.findById(req.headers.userId).populate('resident.selectedHouse')
    if (user) {
        alert = req.body.alert
        if (!alert)
            res.status(401).send(resFormat.rError({
                message: message.en.alert['1']
            }))
        else {
            alert.createdAt = new Date()
            alert.createdBy = user.fullName
            if (user.userType == 'resident')
                alert.houseNo = user.resident.selectedHouse.name
            user.alerts.push(alert)
            await user.save()
            if (alert.type == "emergency") {
                guards = await User.find({
                    userType: 'guards',
                    communities: user.communities[0]
                })
                for (guard of guards) {
                    guard.alerts.push(alert)
                    await guard.save()
                    tokens = []
                    guard.deviceTokens.forEach(tokenObj => {
                        tokens.push(tokenObj.deviceToken)
                    });
                    notification = {
                        title: "CSA Alert",
                        body: alert.comment
                    }
                    if (tokens.length > 0) {
                        PN.send(notification, tokens, true, guard.badgeCount)
                    }
                }
                res.send(resFormat.rSuccess({
                    message: message.en.alert['2']
                }))
            }else{
                res.send(resFormat.rSuccess({
                    message: message.en.alert['2']
                }))
            }
        }
    } else {
        res.status(401).send(resFormat.rError({
            message: message.en.common['1']
        }))
    }
}


async function list(req, res) {
    user = await User.findById(req.headers.userId)
    if(user){
        alerts = user.alerts
        res.send(resFormat.rSuccess({
           alerts
        }))
    }else{
        res.status(401).send(resFormat.rError({
            message: "User not found"
        }))
    }
}



router.post("/", jwtHelper.verifyJwtToken, list)
router.post("/create", jwtHelper.verifyJwtToken, create)


module.exports = router