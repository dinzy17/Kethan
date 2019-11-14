var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var Users = require("./../models/User")

passport.use('webUser', new LocalStrategy({
    usernameField: 'email'
  },
  
  function(username, password, done) {
    Users.findOne({ email: username }, function (err, user) {
      
      if (err) { return done(err) }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'Invalid email'
        })
      }
      /*if (!user.active) {
        return done(null, false, {
          message: 'User is not Active'
        })
      }*/

      const validator = user.validPassword(password, user)
      // Return if password is wrong
      if (validator == false) {
        return done(null, false, {
          message: 'Please enter correct password.'
        })
      }
      if (validator == -1) {
        return done(null, false, {
          message: 'Please enter correct password.'
        })
      }

      // If credentials are correct, return the user object
      return done(null, user)
    })
  }
))

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
