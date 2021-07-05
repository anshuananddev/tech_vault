const passport = require('passport')
const User = require('../models/userModel')
const LocalStrategy = require('passport-local').Strategy
const flash = require('connect-flash')



passport.serializeUser(function(user , done) {
    done(null , user.id)
})

passport.deserializeUser(function(id , done ) {
    User.findById(id , function(err , user){
        done(err , user) ;
    })
})
passport.use( new LocalStrategy( { passReqToCallback :true  , usernameField : 'email'} ,async function(req , username , password , done){
    try{
        
        
        const user = await User.findByCredentials( username , password)
        return done(null , user)
    }catch(e){
        
        return done(null , false , req.flash('loginerror' , "Invalid Credentials"))
    }
}))


function ensureAuthenticated(req ,res , next){
    if(req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')

}

module.exports = { ensureAuthenticated }