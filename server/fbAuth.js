var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
})

passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID,
  clientSecret: process.env.APP_SECRET,
  callbackURL: 'https://localhost:5000/auth/facebook/callback'},
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

module.exports = passport;