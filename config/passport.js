const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcryptjs=require('bcryptjs');

const userSchema=require('../models/userSchema');
module.exports=function(passport){
    passport.use(new LocalStrategy({usernameField:'email'},
        (email, password, done)=> {
          userSchema.findOne({ email: email }, (err, user)=> {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: 'The email is not registered.' });
            }
            bcryptjs.compare(password,user.password,(err,isMatch)=>{
                if(err) throw err;
                if(isMatch){
                    return done(null,user);
                }else{
                    return done(null,false,{ message: 'Incorrect Password'});
                }
            })
          });
        }
      ));
      passport.serializeUser(function(user, done) {
        done(null,user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        userSchema.findById(id, function(err, user) {
          done(err, user);
        });
      });
}


