const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('../models/User');

module.exports = async (passport) => {
  passport.use(
    new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
      try {
        const user = await User.findOne({email: email})
        if (!user) { return done(null, false, {message: "Email Not Registered"}) }

        // If user matches
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) { return done(null, user) }
        else {
          return done(null, false, {message: 'Password Incorrect'})
        }
      }
      catch(err) {
        console.log(err)
      }
      
    })
  )
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}