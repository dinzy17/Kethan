var express = require('express')
var router = express.Router()
var passport = require('passport')
const mongoose = require('mongoose')
var async = require('async')
const { isEmpty } = require('lodash')

const User = require('./../models/User')
const EmailTemplate = require('./../models/EmailTemplate')
var constants = require('./../config/constants')
const resFormat = require('./../helpers/responseFormat')
const sendEmail = require('./../helpers/sendEmail')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const auth = require('./../helpers/authMiddleware');

//function to create or register new user
async function signUp(req, res) {
  var user = new User()
  if (req.body.socialMediaToken && req.body.socialMediaToken != "") {
    user.socialMediaToken = req.body.socialMediaToken
    user.socialPlatform = req.body.socialPlatform
    user.fullName = req.body.name;
    user.email = req.body.email;
    user.phoneNumber = req.body.phoneNumber;
    user.profession = req.body.profession;
    user.emailVerified = true;
    user.active = false;
    user.createdOn = new Date();
    user.save(async function(err, newUser) {
      if (err) {
        res.status(403).send(resFormat.rError(err))
      } else {
        responceData = {
          "userId": newUser._id,
          "email":newUser.email
        }
        res.send(resFormat.rSuccess({message:"User refisterd successfully", data:responceData}))
      }
    })
  } else {
    if(req.body.email == '' || req.body.email == undefined ) {
      res.status(400).send(resFormat.rError({ message: "Please fill all required details." }))
    } else {
      User.find({ email: req.body.email }, { _id: 1, email:1, emailVerified:1}, function(err, result) {
        if (err) {
          res.status(403).send(resFormat.rError(err))
        } else if (result && result.length == 0) {
          let otp = generateOTP()
          user.resetOtp = otp;
          user.emailVerified = false;
          user.fullName = req.body.name;
          user.email = req.body.email;
          user.phoneNumber = req.body.phoneNumber;
          user.profession = req.body.profession;
          user.active = false;
          user.createdOn = new Date();
          user.save(async function(err, newUser) {
            if (err) {
              res.status(403).send(resFormat.rError(err))
            } else {
              let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
              if (template) {
                template = JSON.parse(JSON.stringify(template));
                let body = template.mailBody.replace("{otp}", otp);
                const mailOptions = {
                  to: req.body.email,
                  subject: template.mailSubject,
                  html: body
                }
                sendEmail.sendEmail(mailOptions)
              }
              responceData = {
                "userId": newUser._id,
                "email":newUser.email
              }
              res.send(resFormat.rSuccess(responceData))
            }
          })
        }else if (!result.emailVerified) {
          res.status(407).send(resFormat.rError( { message:"please verify your email", data: {"email": req.body.email} } ))
        } else {
          res.status(406).send(resFormat.rError({ message: "You are already registered" }))
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
        res.status(400).send(resFormat.rError(err))
      } else if (user) {
       // if(new Date(user.subscription_expired_date) < new Date()){
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
                profession: user.profession
              }
            }
            res.send(resFormat.rSuccess(userObj))
          } else {
            res.status(400).send(resFormat.rError({message:"Invalid email"}))
          }
        // }else{
        //   res.send(resFormat.rError({message:"your subscription is expired"}))
        // }
       
      } else {
        res.status(400).send(resFormat.rError({ message: "You do not have account connected with this email ID. Please signup instead." }))
      }
    }) // end of user find
  } else {
    passport.authenticate('webUser', "appUser" ,async function (err, user, info) {
      if (err) {
        res.status(400).send(resFormat.rError(err))
      } else if (info) {
        res.status(400).send(resFormat.rError(info))
      } else if (user) {
        if(user.emailVerified){
           //  if(new Date(user.subscription_expired_date) < new Date()){
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
                    name: user.fullName,
                    contactNumber: user.contactNumber,
                    email: user.email,
                    profession: user.profession
                  }
                }
                res.send(resFormat.rSuccess(userObj))
              } else {
                res.status(400).send(resFormat.rError({message:"Invalid email"}))
              }
            // }else{
            //   res.send(resFormat.rError({message:"your subscription is expired"}))
            // }
          } else {
            res.status(406).send(resFormat.rError({message:"Your email is not verify."}))    
          }
      } else {
        res.status(400).send(resFormat.rError({message:"Please enter correct password."}))
      }
    })(req, res)
  }
}

//logout
async function signout(req, res) {
  if (req.body.userId) {
    if (req.body.deviceid) {
      let user = await User.findById(req.body.userId)
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
              deviceTokens: deviceTokens,
              accessToken: undefined
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
  return OPT
}

//send otp in email to reset password
async function forgotPassword(req, res) {
  if (!req.body.email) {
    res.status(400).send(resFormat.rError({message:"Email required"}))
  } else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
      let otp = generateOTP()
      await User.updateOne({ _id: user._id }, {$set: { resetOtp: otp, accessToken: null } })
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
        res.send(resFormat.rSuccess({message:'We have sent you reset instructions. Please check your email.', email:req.body.email, otp:otp}))
      } else {
        res.status(403).send(resFormat.rError({message:'Some error Occured'}))
      }

    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//reset password using otp
async function resetPassword(req, res) {
  if (!req.body.email)
    res.status(400).send(resFormat.rError({message:"Email required"}))
  else if (!req.body.password)
    res.status(400).send(resFormat.rError({message:"Password required"}))
  else if (!req.body.resetOtp)
    res.status(400).send(resFormat.rError({message:"Otp required"}))
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
          res.status(403).send(resFormat.rError(err))
        }
    } else {
        res.status(406).send(resFormat.rError({message:"Invalid OTP"}))
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//change password
async function changePassword(req, res) {
  if (!req.body.password)
    res.status(400).send(resFormat.rError({message:"New password required"}))
  else if (!req.body.oldPassword)
    res.status(400).send(resFormat.rError({message:"Current Password required"}))
  else {
    let user = await User.findById(req.body.userId)
    if (user) {
      if (!user.validPassword(req.body.oldPassword, user)) {
        res.status(406).send(resFormat.rError({message:'Invalid password'}))
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
          res.status(403).send(resFormat.rError(err))
        }
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

// function to change users Email Id
async function changeEmail(req, res) {
  User.find({"email":req.body.email}, { _id: 1}, function(err, checkUsers){
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      if(checkUsers && checkUsers.length > 0){
        res.status(401).send(resFormat.rError({ message: "Email ID has been already registered" }))
      } else {
        // send OPT for verify email.
        let otp = generateOTP()
        let set = {}
        set.resetOtp = otp;
        User.update({ _id : req.body.userId}, { $set: set }, { runValidators: true, context: 'query' }, async (err, updateUser) =>{
          if (err){
              res.send(resFormat.rError(err))
            }
           else {
              let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
            if (template) {
              template = JSON.parse(JSON.stringify(template));
              let body = template.mailBody.replace("{otp}", otp);
              const mailOptions = {
                to: req.body.email,
                subject: template.mailSubject,
                html: body
              }
              sendEmail.sendEmail(mailOptions)
            } 
            res.send(resFormat.rSuccess({message: 'OPT send in your email confirm this OPT', data: {"email": req.body.email, "userId":req.body.userId}}))
          }
        }) //end of update
      } // end of length > 0
    }
  }) //end of user find
}

// function to check user email for already registerd or not.
async function checkEmail( req, res) {
  let set = { email: req.body.email }
  User.find(set, { _id: 1}, function(err, checkUsers){
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      if(checkUsers && checkUsers.length > 0){
        res.status(402).send(resFormat.rError({ message:"Email ID has been already registered" }))
      } else {
        res.send(resFormat.rSuccess())
      } // end of length > 0
    }
  }) //end of user find
}

// function to check user email for already registerd or not.
async function checkSocialMediaToken( req, res) {
  let set = { socialMediaToken: req.body.socialMediaToken }
  User.find(set, { _id: 1}, function(err, checkUsers){
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      if(checkUsers && checkUsers.length > 0){
        res.status(402).send(resFormat.rError({ message:"User has been already registered" }))
      } else {
        res.send(resFormat.rSuccess())
      } // end of length > 0
    }
  }) //end of user find
}

//set password while signUp
async function setPassword(req, res) {
  if (!req.body.password){
    res.status(400).send(resFormat.rError({message:"password required"}))
  }else if(req.body.email == "" || req.body.email == undefined){
    res.status(400).send(resFormat.rError({message:"invalid rquest"}))
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
            responceData = {
              "userId":user._id,
              "email":req.body.email
            }
          res.send(resFormat.rSuccess({message:'Password has been set successfully.', data:responceData}))
        } else {
          res.status(403).send(resFormat.rError(err))
        }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//set password while signUp
async function verifyOPT(req, res) {
  if (!req.body.opt){
    res.status(400).send(resFormat.rError({message:"opt required"}))
  }else if(req.body.email =="" || req.body.email == undefined){
    res.status(400).send(resFormat.rError({message:"invalid request"}))
  }else {
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
            responceData = {
              "userId": user._id,
              "email":user.email
            }
            res.send(resFormat.rSuccess({ message:'Email verify successfully.', data: responceData }))
          } else {
            res.status(403).send(resFormat.rError(err))
          }
        }else{
            res.status(406).send(resFormat.rError({message:"please enter correct otp"}))  
        }
      }else{
        res.status(406).send(resFormat.rError({message:"your email is already verified"}))  
      }
    } else {
      res.status(404).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//verify OPT while change email
async function changeEmailVerifyOPT(req, res) {
  if (!req.body.opt){
    res.status(400).send(resFormat.rError({message:"opt required"}))
  }else if (req.body.userId =="" || req.body.userId == undefined) {
    res.status(400).send(resFormat.rError({message:"invalid request"}))
  } else {
    let user = await User.findOne({"_id": req.body.userId});
    if (user) {
        if (req.body.opt == user.resetOtp) {
          let upateUser = await User.updateOne({
            _id: user._id
          }, {
            $set: {
              emailVerified: true,
              email: req.body.email
            }
          })
          if (upateUser) {
            responceData = {
              "userId":user._id
            }
            res.send(resFormat.rSuccess({message:'Email verify successfully.', data: responceData}))
          } else {
            res.status(403).send(resFormat.rError(err))
          }
        } else {
            res.status(406).send(resFormat.rError({message:"please enter correct otp"}))  
        }
    } else {
      res.status(406).send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//function to check and signin user details
function adminSigin(req, res) {
  passport.authenticate('adminUser' ,async function (err, user, info) {
      if (err) {
        res.send(resFormat.rError(err))
      } else if (info) {
        res.send(resFormat.rError(info))
      } else if (user) {
        var token = user.generateJwt();
        var params = {
          accessToken: token,
        }
        let updatedUser = await User.updateOne({
          _id: user._id
        }, {
          $set: params
        })

        if (updatedUser) {
          let userObj = {
            token: token,
            userId: user._id,
            username:user.email, 
            user: {
              name: user.fullName,
              email: user.email,
            }
          }
          res.send(resFormat.rSuccess(userObj))
        } else {
          res.send(resFormat.rError({message:"Invalid email"}))
        }
      } else {
        res.send(resFormat.rError({message:"Please enter correct password."}))
      }
    })(req, res)
}

//function to admin forgot password.

//function to generate reset password link for admin
function adminForgotPassword (req, res) {
  //find user based on email id
  User.findOne({"email": req.body.email, "userType":"adminUser" }, {}, function(err, user) {
    if (err) {
      res.status(401).send(resFormat.rError(err))
    } else if(!user){
      res.send(resFormat.rError("Incorrect email."))
    } else{
        let clientUrl = constants.clientUrl
        var link =  clientUrl + '/#/reset/' + new Buffer(user._id.toString()).toString('base64');

        //forgot password email template
        emailTemplatesRoute.getEmailTemplateByCode("sendAdminResetPwd").then((template) => {
          if(template) {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{link}", link);
            const mailOptions = {
              to : "gaurav@arkenea.com", //req.body.email,
              subject : template.mailSubject,
              html: body
            }
            sendEmail.sendEmail(mailOptions)
            res.send(resFormat.rSuccess('We have sent you reset instructions. Please check your email.'))
          } else {
            res.status(401).send(resFormat.rError('Some error Occured'))
          }
        }) // forgot password email template ends*/
      }
  }) // find user based on email id ends
}

//function to reset the password
const adminResetPassword = function(req,res) {
  User.findOne({_id: mongoose.Types.ObjectId(new Buffer(req.body.userId, 'base64').toString('ascii'))}, function(err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      const user = new User()
      const { salt, hash } = user.setPassword(req.body.password)
      User.update({ _id: userDetails._id},{ $set: { salt, hash}} ,(err, updatedUser)=>{
        if (err) {
          res.send(resFormat.rError(err))
        } else {
          res.send(resFormat.rSuccess('Password has been updated'))
        }
      })
    }
  })
}




router.post("/signin", signin)
router.delete("/signout", auth, signout)
router.post("/forgotPassword", forgotPassword)
router.post("/resetPassword", resetPassword)
router.post("/changePassword", auth, changePassword)
router.post("/changeEmail", auth, changeEmail)
router.post("/checkEmail", checkEmail)
router.post("/checkSocialMediaToken", checkSocialMediaToken)
router.post("/signup", signUp)
router.post("/setpassword", setPassword)
router.post("/verifyOPT", verifyOPT)
router.post("/changeEmailVerifyOPT", auth, changeEmailVerifyOPT)
router.post("/adminSigin", adminSigin)
router.post("/adminForgotPassword", adminForgotPassword)
router.post('/adminResetPassword', adminResetPassword)

module.exports = router
