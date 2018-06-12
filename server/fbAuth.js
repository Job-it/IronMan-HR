var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
require('dotenv').config();

passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID,
  clientSecret: process.env.APP_SECRET,
  callbackURL: 'https://localhost:5000/'},
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    done(null, profile);
  }
));

module.exports = passport;