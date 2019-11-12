var express = require('express')
var router = express.Router()
var passport = require('passport')
const mongoose = require('mongoose')
var _ = require('lodash');
var async = require('async')
var fs = require('fs')
const { isEmpty } = require('lodash')

const User = require('./../models/User')
const EmailTemplate = require('./../models/EmailTemplate')
var constants = require('./../config/constants')
var message = require('./../config/messages')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const jwtHelper = require('../helpers/jwtHelper');


//function to create or register new user
async function signUp(req, res) {
  var user = new User()
  var signupType = "withEmail";
  if(req.body.socialMediaToken && req.body.socialMediaToken != "") {
    user.socialMediaToken = req.body.socialMediaToken
    user.socialPlatform = req.body.socialPlatform
    user.emailVerified = true;
    var token = user.generateJwt();
    user.token = token;
    user.active = false;
    user.createdOn = new Date();
    user.save(async function(err, newUser) {
      if (err) {
        res.send(resFormat.rError(err))
      } else {
        res.send(resFormat.rSuccess(newUser))
      }
    })
  } else {
    user.email = req.body.email
    if(req.body.email == '' || req.body.email == undefined ) {
      res.status(500).send(resFormat.rError("Please fill all required details."))
    } else {
      User.find({ email: req.body.email }, { _id: 1, email:1, emailVerified:1}, function(err, result) {
        if (err) {
          res.status(500).send(resFormat.rError(err))
        } else if (result && result.length == 0) {
          let otp = generateOTP()
          user.resetOtp = otp;
          user.emailVerified = false;
          var token = user.generateJwt();
          user.token = token;
          user.fullName = req.body.name;
          user.email = req.body.email;
          user.phoneNumber = req.body.phoneNumber;
          user.active = false;
          user.createdOn = new Date();
          user.save(async function(err, newUser) {
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              /*let template = await emailTemplatesRoute.getEmailTemplateByCode("sendResetPwd")
              if (template) {
                template = JSON.parse(JSON.stringify(template));
                let body = template.mailBody.replace("{otp}", otp);
                const mailOptions = {
                  to: req.body.email,
                  subject: template.mailSubject,
                  html: body
                }
                sendEmail.sendEmail(mailOptions)
              } */
              res.send(resFormat.rSuccess(newUser))
            }
          })
        }else if(!result.emailVerified){
          res.send(resFormat.rError({"message":"please verify your email", "data": {"email": req.body.email}}))
        } else {
          res.send(resFormat.rError(`You are already registered` ))
        }
      })
    }
  }
}

//function to check and signin user details
function signin(req, res) {
  if(req.body.socialMediaToken && req.body.socialMediaToken != "") {
    User.findOne({ $or: [ { socialMediaToken: req.body.socialMediaToken }, { email: req.body.email } ] }, async function(err,user){
      if (err) {
        res.status(404).send(resFormat.rError(err))
      } else if (user) {
        if(new Date(user.subscription_expired_date) < new Date()){
          var token = user.generateJwt();

          deviceTokens = user.deviceTokens
          if(req.body.device_id && req.body.device_token){
            let tokenObj = {
              deviceId: req.body.device_id,
              deviceToken: req.body.device_token
            }
            existingIndex = user.deviceTokens.findIndex((o) => o.deviceId == req.body.device_id)
            if(existingIndex > -1)
              deviceTokens.splice(existingIndex, 1)
            deviceTokens.push(tokenObj)
          }

          var params = {
            accessToken: token,
            deviceTokens: deviceTokens
          }

          let updatedUser = await User.updateOne({
            _id: user._id
          }, {
            $set: params
          })

          if (updatedUser) {
            let userObj = {
              accessToken: token,
              userId: user._id,
              user: {
                fullName: user.fullName,
                phoneNumber: user.contactNumber ,
                email: user.email,
              }
            }
            res.send(resFormat.rSuccess(userObj))
          } else {
            res.send(resFormat.rError({message:"Invalid email"}))
          }
        } else {
          res.send(resFormat.rError({message:"your subscription is expired"}))
        }

      } else {
        res.send(resFormat.rError("You do not have account connected with this email ID. Please signup instead."))
      }
    }) // end of user find
  } else {
    passport.authenticate('allUsers', async function (err, user, info) {
      if (err) {
        res.status(404).send(resFormat.rError(err))
      } else if (info) {
        res.status(404).send(resFormat.rError(info))
      } else if (user) {
          if(new Date(user.subscription_expired_date) < new Date()){
            var token = user.generateJwt();

            deviceTokens = user.deviceTokens
            if(req.body.device_id && req.body.device_token){
              let tokenObj = {
                deviceId: req.body.device_id,
                deviceToken: req.body.device_token
              }
              existingIndex = user.deviceTokens.findIndex((o) => o.deviceId == req.body.device_id)
              if(existingIndex > -1)
                deviceTokens.splice(existingIndex, 1)
              deviceTokens.push(tokenObj)
            }

            var params = {
              accessToken: token,
              deviceTokens: deviceTokens
            }

            let updatedUser = await User.updateOne({
              _id: user._id
            }, {
              $set: params
            })

            if (updatedUser) {
              let userObj = {
                accessToken: token,
                userId: user._id,
                user: {
                  fullName: user.fullName,
                  phoneNumber: user.contactNumber ,
                  email: user.email,
                }
              }
              res.send(resFormat.rSuccess(userObj))
            } else {
              res.send(resFormat.rError({message:"Invalid email"}))
            }
          }else{
            res.send(resFormat.rError({message:"your subscription is expired"}))
          }

      } else {
        res.status(404).send(resFormat.rError({message:"Please enter correct password."}))
      }
    })(req, res)
  }
}

//logout
async function signout(req, res) {
  if (req.headers.userId) {
    if (req.headers.deviceid) {
      let user = await User.findById(req.headers.userId)
      if (user) {
        let deviceTokens = user.deviceTokens
        let tokenIndex = _.findIndex(deviceTokens, {
          deviceId: req.headers.deviceid
        })
        if (tokenIndex != -1) {
          deviceTokens.splice(tokenIndex, 1)
          let upatedUser = await User.updateOne({
            _id: user._id
          }, {
            $set: {
              deviceTokens: deviceTokens
            }
          })
        }
        res.send(resFormat.rSuccess())
      } else {
        res.status(404).send(resFormat.rError({message:"User not found"}))
      }
    } else {
      res.send(resFormat.rSuccess())
    }
  } else {
    res.status(404).send(resFormat.rError({message:"User not found"}))
  }
}

// genrate OPT
function generateOTP() {
  var OPT = Math.floor(1000 + Math.random() * 9000);
  console.log('opt HRE', OPT);
  return OPT
}

//send otp in email to reset password
async function forgotPassword(req, res) {
  if (!req.body.email)
    res.status(404).send(resFormat.rError({message:"Email required"}))
  else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
      let otp = generateOTP()
      await User.updateOne({
        _id: user._id
      }, {
        $set: {
          resetOtp: otp,
          accessToken: null
        }
      })
      let template = await emailTemplatesRoute.getEmailTemplateByCode("sendResetPwd")
      if (template) {
        template = JSON.parse(JSON.stringify(template));
        let body = template.mailBody.replace("{otp}", otp);
        const mailOptions = {
          to: req.body.email,
          subject: template.mailSubject,
          html: body
        }
        sendEmail.sendEmail(mailOptions)
        res.send(resFormat.rSuccess({message:'We have sent you reset instructions. Please check your email.',otp:otp}))
      } else {
        res.status(401).send(resFormat.rError({message:'Some error Occured'}))
      }

    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//reset password using otp
async function resetPassword(req, res) {
  if (!req.body.email)
    res.status(404).send(resFormat.rError({message:"Email required"}))
  else if (!req.body.password)
    res.status(404).send(resFormat.rError({message:"Password required"}))
  else if (!req.body.resetOtp)
    res.status(404).send(resFormat.rError({message:"Otp required"}))
  else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
      if (user.resetOtp == req.body.resetOtp) {
        const {
          salt,
          hash
        } = user.setPassword(req.body.password)

        let upateUser = await User.update({
          _id: user._id
        }, {
          $set: {
            salt,
            hash,
            accessToken: null
          }
        })
        if (upateUser) {
          res.send(resFormat.rSuccess({message:'Password has been changed successfully'}))
        } else {
          res.send(resFormat.rError(err))
        }
    } else {
        res.status(404).send(resFormat.rError({message:"Invalid OTP"}))
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//change password
async function changePassword(req, res) {
  if (!req.body.password)
    res.status(404).send(resFormat.rError({message:"New password required"}))
  else if (!req.body.oldPassword)
    res.status(404).send(resFormat.rError({message:"Current Password required"}))
  else {
    let user = await User.findById(req.headers.userId)
    if (user) {
      if (!user.validPassword(req.body.oldPassword, user)) {
        res.status(404).send(resFormat.rError({message:'Invalid password'}))
      } else {
        const {
          salt,
          hash
        } = user.setPassword(req.body.password)
        let upateUser = await User.update({
          _id: user._id
        }, {
          $set: {
            salt,
            hash,
            accessToken: null
          }
        })
        if (upateUser) {
          res.send(resFormat.rSuccess({message:'Password has been changed successfully.'}))
        } else {
          res.status(404).send(resFormat.rError(err))
        }
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

// function to change users Email Id
async function changeEmail( req, res) {


  User.find(set, { _id: 1}, function(err, checkUsers){
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      if(checkUsers && checkUsers.length > 0){
        res.send(resFormat.rError("Email ID has been already registered"))
      } else {
        // send OPT for verify email.
        let otp = generateOTP()
        let set = {}
        set.resetOtp = otp;
        User.update({ _id : req.body.userId}, { $set: set }, { runValidators: true, context: 'query' }, (err, updateUser) =>{
          if (err){
              res.send(resFormat.rError(err))
            }
           else {
              /*let template = await emailTemplatesRoute.getEmailTemplateByCode("sendResetPwd")
            if (template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{otp}", otp);
              const mailOptions = {
                to: req.body.email,
                subject: template.mailSubject,
                html: body
              }
              sendEmail.sendEmail(mailOptions)
            } */
            res.send(resFormat.rSuccess({message: 'OPT send in your email confirm this OPT', userData: {"email": req.body.email}}))
          }
        }) //end of update
      } // end of length > 0
    }
  }) //end of user find
}

// function to check user email already registerd or not.
async function checkEmail( req, res) {
  let set = { email: req.body.email }
  User.find(set, { _id: 1}, function(err, checkUsers){
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      if(checkUsers && checkUsers.length > 0){
        res.send(resFormat.rError("Email ID has been already registered"))
      } else {
        res.send(resFormat.rSuccess())
      } // end of length > 0
    }
  }) //end of user find
}

//set password while signUp
async function setPassword(req, res) {
  if (!req.body.password){
    res.status(404).send(resFormat.rError({message:"password required"}))
  }else if(req.body.email == "" || req.body.email == undefined){
    res.status(404).send(resFormat.rError({message:"invalid rquest"}))
  }else {
    let user = await User.findOne({"email": req.body.email});
    if (user) {
        const {
          salt,
          hash
        } = user.setPassword(req.body.password)
        let upateUser = await User.update({
          _id: user._id
        }, {
          $set: {
            salt,
            hash,
            accessToken: null
          }
        })
        if (upateUser) {
          res.send(resFormat.rSuccess({message:'Password has been set successfully.'}))
        } else {
          res.status(404).send(resFormat.rError(err))
        }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//set password while signUp
async function verifyOPT(req, res) {
  if (!req.body.opt){
    res.status(404).send(resFormat.rError({message:"opt required"}))
  } else if(req.body.email =="" || req.body.email == undefined){
    res.status(404).send(resFormat.rError({message:"invalid request"}))
  } else {
    let user = await User.findOne({"email": req.body.email});
    if (user) {
      if(!user.emailVerified){
        if(req.body.opt == user.resetOtp){
          params = {
            emailVerified: true
          }
          let upateUser = await User.updateOne(
            {
              _id: user._id
            }, {
              $set: {
                emailVerified: true
              }
          })
          if (upateUser) {
            res.send(resFormat.rSuccess({message:'Email verify successfully.', data: user}))
          } else {
            res.status(404).send(resFormat.rError(err))
          }
        }else{
            res.status(404).send(resFormat.rError({message:"please enter correct otp"}))
        }
      }else{
        res.status(404).send(resFormat.rError({message:"your email is already verified"}))
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//verify OPT while change email
async function changeEmailVerifyOPT(req, res) {
  if (!req.body.opt){
    res.status(404).send(resFormat.rError({message:"opt required"}))
  }else if(req.body._id =="" || req.body._id == undefined){
    res.status(404).send(resFormat.rError({message:"invalid request"}))
  }else {
    let user = await User.findOne({"_id": req.body._id});
    if (user) {
        if(req.body.opt == user.resetOtp){
          let upateUser = await User.updateOne({
            _id: user._id
          }, {
            $set: {
              emailVerified: true,
              email: req.body.email
            }
          })
          if (upateUser) {
            res.send(resFormat.rSuccess({message:'Email verify successfully.', data: user}))
          } else {
            res.status(404).send(resFormat.rError(err))
          }
        }else{
            res.status(404).send(resFormat.rError({message:"please enter correct otp"}))
        }

    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

router.post("/signin", signin)
router.delete("/signout", jwtHelper.verifyJwtToken, signout)
router.post("/forgotPassword", forgotPassword)
router.post("/resetPassword", resetPassword)
router.post("/changePassword", jwtHelper.verifyJwtToken, changePassword)
router.post("/changeEmail", changeEmail)
router.post("/checkEmail", checkEmail)
router.post("/signup", signUp)
router.post("/setpassword", setPassword)
router.post("/verifyOPT", verifyOPT)
router.post("/changeEmailVerifyOPT", changeEmailVerifyOPT)


module.exports = router
