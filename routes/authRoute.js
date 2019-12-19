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
const common = require('./../helpers/common')
const emailTemplatesRoute = require('./emailTemplatesRoute.js')
const auth = require('./../helpers/authMiddleware');

//function to create or register new user
async function signUp(req, res) {
  var user = new User()
  if(req.body.email == '' || req.body.email == undefined ) {
    res.send(resFormat.rError({ message: "Please fill all required details." }))
  } else {
    // check email and this is an verify email.
    User.find({ email: req.body.email }, { _id: 1, email:1, emailVerified:1 }, async function(err, result) {
      if (err) {
        res.send(resFormat.rError(err))
      } else if ( result && result.length == 0 ) {
          let otp = generateOTP()
          let referralCode = req.body.name.substring(0, 3)+'-'+ otp;
          user.emailVerifiedOtp = otp;
          user.emailVerified = false;
          user.createdEmailVerifiedOtp = new Date();
          user.fullName = req.body.name;
          user.email = req.body.email;
          if(req.body.socialMediaToken != undefined && req.body.socialMediaToken !="" ) {
            user.socialMediaToken = req.body.socialMediaToken
            user.socialPlatform = req.body.socialPlatform
          }
          user.countryCode = req.body.country_code;
          user.contactNumber = req.body.phoneNumber;
          user.profession = req.body.profession;
          user.referralCode = referralCode;
          user.useReferralCode = req.body.referralCode;
          user.userType = "appUser";
          user.active = false;
          user.createdOn = new Date();
          user.save(async function(err, newUser) {
            if (err) {
              res.send(resFormat.rError(err))
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
                "email":newUser.email
              }
              res.send(resFormat.rSuccess(responceData))
            }
          })
      } else if (!result[0].emailVerified) {
        let otp = generateOTP()
        var params = {
          emailVerifiedOtp: otp,
          createdEmailVerifiedOtp: new Date()
        }
        let updatedUser = await User.updateOne({
          _id: result[0]._id
        }, {
          $set: params
        })
        if (updatedUser) {
          let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
              if (template) {
                template = JSON.parse(JSON.stringify(template));
                let body = template.mailBody.replace("{otp}", otp);
                const mailOptions = {
                  to: result[0].email,
                  subject: template.mailSubject,
                  html: body
                }
                sendEmail.sendEmail(mailOptions)
            }
            res.send(resFormat.rError({ message: 'Your email is not verify. We have sent OTP in your email. please verify OTP.', statusCode: '1' }))
            //res.send(resFormat.rError({ message:"Your email is not verify. We have sent OTP in your email. please verify OPT",  data: { "email": req.body.email }}))
        } else {
          res.send(resFormat.rError({ message:"Your email is not verify." }))
        }
      } else {
        res.send(resFormat.rError({ message: "This email is already registered. use different email for signup." }))
      }
    })
  }  
}

//set password while signUp
async function verifyOPT(req, res) {
  if (!req.body.otp){
    res.send(resFormat.rError({message:"OTP is required for verify email."}))
  }else if(req.body.email =="" || req.body.email == undefined){
    res.send(resFormat.rError({message:"Email is required"}))
  }else {
    let user = await User.findOne({"email": req.body.email});
    if (user) {
      if(!user.emailVerified){
        if(req.body.otp == user.emailVerifiedOtp) {
            // check expiry date.
          var expiryTime = new Date(user.createdEmailVerifiedOtp);
          expiryTime.setMinutes(expiryTime.getMinutes() + 15);
          expiryTime = new Date(expiryTime);
          if(new Date() < new Date( expiryTime )){
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
              responceData.isSocialMediaUser = "0"
              if(user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "facebook") {
                responceData.isSocialMediaUser = "1"
              } else if (user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "google") {
                responceData.isSocialMediaUser = "2"
              }
              res.send(resFormat.rSuccess({ message:'Email verify successfully.', user: responceData }))
            } else {
              res.send(resFormat.rError(err))
            }
          } else {
            res.send(resFormat.rError({message:"Your OTP is expire. please resend opt and verify email."}))  
          }
          
        } else {
            res.send(resFormat.rError({message:"OTP not match. Enter correct OTP"}))  
        }
      } else {
        res.send(resFormat.rError({message:"your email is already verified"}))  
      }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}
// resend OPT
async function resendOTP(req, res){
  if (!req.body.email){
    res.send(resFormat.rError({message:"email is required for resend email."}))
  } else {
    let user = await User.findOne({"email": req.body.email});
    if (user) {
      if(!user.emailVerified){
        let otp = generateOTP()
        let upateUser = await User.updateOne(
          {
            _id: user._id
          }, {
            $set: {
              emailVerifiedOtp: otp,
              createdEmailVerifiedOtp: new Date()
            }
        })

        if (upateUser) {
          let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
              if (template) {
                template = JSON.parse(JSON.stringify(template));
                let body = template.mailBody.replace("{otp}", otp);
                const mailOptions = {
                  to: user.email,
                  subject: template.mailSubject,
                  html: body
                }
                sendEmail.sendEmail(mailOptions)
            }
          responceData = {
            "userId": user._id,
            "email":user.email
          }
          res.send(resFormat.rSuccess({message:"OPT sent in your email successfully."}))
        } else {
          res.send(resFormat.rError(err))
        }
      } else {
        res.send(resFormat.rError({message:"your email is already verified"}))  
      }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//set password while signUp
async function setPassword(req, res) {
  if (!req.body.password){
    res.send(resFormat.rError({message:"Password is required"}))
  } else if (req.body.email == "" || req.body.email == undefined) {
    res.send(resFormat.rError({ message:"Invalid request. Email is requierd" }))
  } else {
    let user = await User.findOne({"email": req.body.email});
    if (user) {
      // decript password.
    //  const password = common.decryptPassword(req.body.password);
    const password = req.body.password
        const {
          salt,
          hash
        } = user.setPassword(password)

        // for login 
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


        let upateUser = await User.update({
          _id: user._id
        }, {
          $set: {
            salt,
            hash,
            accessToken: token,
            deviceTokens: deviceTokens
          }
        })
        if (upateUser) {
            userResponce = {
              name: user.fullName,
              country_code: user.countryCode ,
              contactNumber: user.contactNumber,
              email: user.email,
              profession: user.profession
            }
          res.send(resFormat.rSuccess({ message:'Password has been set successfully.', accessToken: token, user: userResponce }))
        } else {
          res.send(resFormat.rError(err))
        }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist"}))
    }
  }
}

//function to check and signin user details
function signin(req, res) {
  if(req.body.socialMediaToken && req.body.socialMediaToken != "") {
    User.findOne({ $or: [ { socialMediaToken: req.body.socialMediaToken }, { email: req.body.email } ] }, async function(err,user){
      if (err) {
        res.send(resFormat.rError(err))
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
              user: {
                name: user.fullName,
                country_code: user.countryCode ,
                contactNumber: user.contactNumber,
                email: user.email,
                profession: user.profession
              }
            }
            userObj.user.isSocialMediaUser = "0"
              if(user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "facebook") {
                userObj.user.isSocialMediaUser = "1"
              } else if (user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "google") {
                userObj.user.isSocialMediaUser = "2"
              }
            res.send(resFormat.rSuccess(userObj))
          } else {
            res.send(resFormat.rError({message:"Invalid email"}))
          }
        // }else{
        //   res.send(resFormat.rError({message:"your subscription is expired"}))
        // }
       
      } else {
        res.send(resFormat.rError({ message: "Not register user", statusCode: '2', socialMediaToken: req.body.socialMediaToken,socialPlatform: req.body.socialPlatform }))
      }
    }) // end of user find
  } else {
    passport.authenticate('webUser', "appUser" ,async function (err, user, info) {
      if (err) {
        res.send(resFormat.rError(err))
      } else if (info) {
        res.send(resFormat.rError(info))
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
                    country_code: user.countryCode ,
                    contactNumber: user.contactNumber,
                    email: user.email,
                    profession: user.profession
                  }
                }
                userObj.user.isSocialMediaUser = "0"
                  if(user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "facebook") {
                    userObj.user.isSocialMediaUser = "1"
                  } else if (user.socialMediaToken != undefined && user.socialMediaToken != "" && user.socialPlatform == "google") {
                    userObj.user.isSocialMediaUser = "2"
                  }
                res.send(resFormat.rSuccess(userObj))
              } else {
                res.send(resFormat.rError({message:"Invalid email"}))
              }
            // }else{
            //   res.send(resFormat.rError({message:"your subscription is expired"}))
            // }
          } else {
            let otp = generateOTP()
            var params = {
              emailVerifiedOtp: otp,
              createdEmailVerifiedOtp: new Date()
            }
            let updatedUser = await User.updateOne({
              _id: user._id
            }, {
              $set: params
            })
            if (updatedUser) {
              let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
                  if (template) {
                    template = JSON.parse(JSON.stringify(template));
                    let body = template.mailBody.replace("{otp}", otp);
                    const mailOptions = {
                      to: user.email,
                      subject: template.mailSubject,
                      html: body
                    }
                    sendEmail.sendEmail(mailOptions)
                }
                res.send(resFormat.rError({ message: 'Your email is not verify. We have sent OTP in your email. please verify OTP.', statusCode: '1' }))
            } else{
              res.send(resFormat.rError({message:"Your email is not verify."}))
            }
          }
      } else {
        res.send(resFormat.rError({message:"Please enter correct password."}))
      }
    })(req, res)
  }
}

//logout
async function signout(req, res) {
  if (req.body.userId) {
   // if (req.body.deviceid) {
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
        res.send(resFormat.rError({message:"User not found"}))
      }
  //  } else {
   //   res.send(resFormat.rSuccess())
   // }
  } else {
    res.send(resFormat.rError({message:"User not found"}))
  }
}

// genrate OPT
function generateOTP() {
  var OPT = Math.floor(100000 + Math.random() * 900000);
  return OPT
}


//send otp in email to reset password
async function forgotPassword(req, res) {
  if (!req.body.email) {
    res.send(resFormat.rError({message:"Email is required for forgot passwprd."}))
  } else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
      if(user.emailVerified){
       // let clientUrl = constants.clientUrl
       // var link =  clientUrl + '/#/reset/' + new Buffer(user._id.toString()).toString('base64');
       let otp = generateOTP()
        var params = {
          resetOtp: otp,
          createdResetOtp: new Date()
        }

        await User.updateOne({ _id: user._id }, { $set: params })
        //forgot password email template
        emailTemplatesRoute.getEmailTemplateByCode("sendResetPwd").then((template) => {
          if(template) {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{otp}", otp);
            const mailOptions = {
              to : req.body.email,
              subject : template.mailSubject,
              html: body
            }
            sendEmail.sendEmail(mailOptions)
            res.send(resFormat.rSuccess({ message:'We have sent you reset instructions. Please check your email.' }))
          } else {
            res.send(resFormat.rError('Some error Occured'))
          }
        }) // forgot password email template ends*/
      } else {
        // send OTP for verify email
        let otp = generateOTP()
        var params = {
          emailVerifiedOtp: otp,
          createdEmailVerifiedOtp: new Date()
        }
        let updatedUser = await User.updateOne({
          _id: user._id
        }, {
          $set: params
        })
        if (updatedUser) {
          let template = await emailTemplatesRoute.getEmailTemplateByCode("resendVerifySignup")
              if (template) {
                template = JSON.parse(JSON.stringify(template));
                let body = template.mailBody.replace("{otp}", otp);
                const mailOptions = {
                  to: user.email,
                  subject: template.mailSubject,
                  html: body
                }
                sendEmail.sendEmail(mailOptions)
            }
            res.send(resFormat.rError({ message: 'Your email is not verify. We have sent OTP in your email. please verify OTP.', statusCode: '1' }))
        } else {
          res.send(resFormat.rError({message:"Your email is not verify."}))
        }
      }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//reset password using otp
async function resetPassword(req, res) {
  if (!req.body.email) {
    res.send(resFormat.rError({message:"Email is required"}))
  } else if (!req.body.password) {
    res.send(resFormat.rError({message:"Password is required"}))
  } else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
        const password = req.body.password

        const {
          salt,
          hash
        } = user.setPassword(password)

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
      res.send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}

//reset password using otp
async function forgotPasswordVerifyOTP(req, res) {
  if (!req.body.email){
    res.send(resFormat.rError({message:"Email is required"}))
  } else if (!req.body.resetOtp) {
    res.send(resFormat.rError({message:"Otp is required"}))
  } else {
    let user = await User.findOne({
      "email": req.body.email
    })
    if (user) {
      if (user.resetOtp == req.body.resetOtp) {
        res.send(resFormat.rSuccess({ email:req.body.email }))
    } else {
        res.send(resFormat.rError({message:"Invalid OTP"}))
      }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist. Sign up to create an account."}))
    }
  }
}



//change password
async function changePassword(req, res) {
  if (!req.body.password)
    res.send(resFormat.rError({message:"New password is required"}))
  else if (!req.body.oldPassword)
    res.send(resFormat.rError({message:"Current Password is required"}))
  else {
    let user = await User.findById(req.body.userId)
    if (user) {
        // decript password.
        //const oldPassword = common.decryptPassword(req.body.oldPassword);
        const oldPassword = req.body.oldPassword

      if (!user.validPassword(oldPassword, user)) {
        res.send(resFormat.rError({message:'Invalid current password'}))
      } else {
        // decript password.
        //const password = common.decryptPassword(req.body.password);
        const password = req.body.password
        const {
          salt,
          hash
        } = user.setPassword(password)

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
          res.send(resFormat.rError(err))
        }
      }
    } else {
      res.send(resFormat.rError({message:"Looks like your account does not exist"}))
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
        res.send(resFormat.rError({ message: "Email ID has been already registered" }))
      } else {
        // send OPT for verify email.
        let otp = generateOTP()
        let set = {}
        set.email = req.body.email
        set.emailVerifiedOtp = otp;
        set.createdEmailVerifiedOtp = new Date();
        set.emailVerified = false;
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
        res.send(resFormat.rError({ message:"Email ID has been already registered" }))
      } else {
        res.send(resFormat.rSuccess())
      } // end of length > 0
    }
  }) //end of user find
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
async function adminForgotPassword (req, res) {
  //find user based on email id
  User.findOne({"email": req.body.email, "userType":"adminUser" }, {}, async function(err, user) {
    if (err) {
      res.send(resFormat.rError(err))
    } else if(!user){
      res.send(resFormat.rError("This email is not registered. Use registered email for forgot password."))
    } else{
        let clientUrl = "http://3.135.146.133:3000";  //constants.clientUrl
        var link =  clientUrl + '/reset/' + new Buffer(user._id.toString()).toString('base64');
        await User.updateOne({ _id: user._id }, {$set: { accessToken: null,createdResetOtp: new Date(), isForgotPassword: true }})
        //forgot password email template
        emailTemplatesRoute.getEmailTemplateByCode("sendAdminResetPwd").then((template) => {
          if(template) {
            template = JSON.parse(JSON.stringify(template));
            let body = template.mailBody.replace("{link}", link);
            const mailOptions = {
              to : req.body.email, //gaurav@arkenea.com
              subject : template.mailSubject,
              html: body
            }
            sendEmail.sendEmail(mailOptions)
            res.send(resFormat.rSuccess({ message:'We have sent you reset instructions. Please check your email.'}))
          } else {
            res.send(resFormat.rError('Some error Occured'))
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
      var expiryTime = new Date(userDetails.createdResetOtp);
      expiryTime.setMinutes(expiryTime.getMinutes() + 15);
      expiryTime = new Date(expiryTime);
      if(userDetails.isForgotPassword){
        if(new Date() < new Date( expiryTime )){
          const user = new User()
          const { salt, hash } = user.setPassword(req.body.password)
          User.update({ _id: userDetails._id},{ $set: { salt, hash, isForgotPassword: false }} ,(err, updatedUser)=>{
            if (err) {
              res.send(resFormat.rError(err))
            } else {
              res.send(resFormat.rSuccess({userType:userDetails.userType, message:'Password has been updated'}))
            }
          })
        } else {
          res.send(resFormat.rError({message:"Your link is expire. Please try again."}))   
        }
      } else {
        res.send(resFormat.rError({message:"Your link is expire. Please try again."}))   
      }
    }
  })
}

// function to reset the password
async function getUserEmail (req,res) {
  User.findOne({_id: mongoose.Types.ObjectId(new Buffer(req.body.userId, 'base64').toString('ascii'))},{ email:1 }, function(err, userDetails) {
    if (err) {
      res.send(resFormat.rError(err))
    } else {
      res.send(resFormat.rSuccess({ email:userDetails.email }))
    }
  })
}

// function to reset the password
async function checkPassword ( req, res ) {
  const password = common.decryptPassword(req.body.password);
  res.send(resFormat.rSuccess({ password: password }))
}




router.post("/signin", signin)
router.delete("/signout", auth, signout)
router.post("/forgotPassword", forgotPassword)
router.post("/forgotPasswordVerifyOTP", forgotPasswordVerifyOTP)
router.post("/resetPassword", resetPassword)
router.post("/changePassword", auth, changePassword)
router.post("/changeEmail", auth, changeEmail)
router.post("/checkEmail", checkEmail)
router.post("/signup", signUp)
router.post("/setpassword", setPassword)
router.post("/verifyOPT", verifyOPT)
router.post("/resendOTP", resendOTP)
router.post("/adminSigin", adminSigin)
router.post("/adminForgotPassword", adminForgotPassword)
router.post('/adminResetPassword', adminResetPassword)
router.post('/getUserEmail', getUserEmail)
router.post('/checkPassword', checkPassword)



module.exports = router
