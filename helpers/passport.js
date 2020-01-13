var passport = require('passport')
const common = require('./../helpers/common')
var LocalStrategy = require('passport-local').Strategy
var Users = require("./../models/User")
const sendEmail = require('./sendEmail')
const emailTemplatesRoute = require('./../routes/emailTemplatesRoute.js')

passport.use('webUser',new LocalStrategy({
    usernameField: 'email'
  },
    
  function(username, password, done) {
    Users.findOne({ email: username },  async function (err, user) {
      
      if (err) { return done(err) }
      // Return if user not found in database
      if (!user) {
        return done(null, false, { message: 'Invalid email' })
       } else if (!user.emailVerified) {

        let otp = Math.floor(1000 + Math.random() * 9000);
        var params = {
          emailVerifiedOtp: otp,
          createdEmailVerifiedOtp: new Date()
        }
        let updatedUser = await Users.updateOne({
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
          return done(null, false, { message: 'Your email is not verify. We have sent OTP in your email. please verify OTP.', statusCode: '1' })
        } else {
          return done(null, false, { message: 'Your email is not verify.' })
        }
      } else if (!user.active) {
         return done(null, false, { message: 'Your account is in-active. contact to admin for active your account.' })
       }
      // decript password.
      //const passwordDecript = common.decryptPassword(password);
      const passwordDecript = password

      const validator = user.validPassword(passwordDecript, user)

      if (validator == false || validator == -1) {
        return done(null, false, { message: 'The password seems to be incorrect.' }) // Return if password is wrong
      }

      return done(null, user) // If credentials are correct, return the user object
    }) //end of user find
  }
))

// for admin user

passport.use('adminUser',new LocalStrategy({
  usernameField: 'email'
},
  
function(username, password, done) {
  Users.findOne({ email: username, userType: "adminUser" }, function (err, user) {
    
    if (err) { return done(err) }
    // Return if user not found in database
    if (!user) {
      return done(null, false, { message: 'Invalid email' })
     } // else if (!user.active) {
    //   return done(null, false, { message: 'User is not Active' })
    // }
    const validator = user.validPassword(password, user)

    if (validator == false || validator == -1) {
      return done(null, false, { message: 'Please enter correct password.' }) // Return if password is wrong
    }

    return done(null, user) // If credentials are correct, return the user object
  }) //end of user find
}
))

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const decrypt = (textBase64, keyBase64, ivBase64) => {
    const algorithm = 'aes-128-cbc';
    const ivBuffer = Buffer.from(ivBase64, 'base64');
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
    decipher.setAutoPadding(false);

    let decrypted = decipher.update(textBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
