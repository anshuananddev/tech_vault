require('dotenv').config({ path : __dirname + '/.env'})
const express = require('express')
const session  = require('express-session')
const expressValidator = require('express-validator')
const hbs = require('hbs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const path = require('path')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const mongoStore = require('connect-mongo')
const flash = require('connect-flash')
const helpers = require('handlebars-helpers')



//const mongodb = require('mongodb')

//importing own-defined modules 

const User = require('./models/userModel')
const Project = require('./models/projectModel')
const auth = require('./middlewares/auth')

const conn = require('./config/db')
// console.log(typeof conn)
// console.log(conn)

//instantiating express 
var app = express()

//setting up view engine
app.set('views' , path.join(__dirname , "../templates/views"))
app.set('view engine' , 'hbs')
hbs.registerPartials(path.join(__dirname , '../templates/partials'))

//setting up global middlewares 

app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(express.static(path.join(__dirname , '../public')))


//setting up cookie-session
app.use( session ({
    secret : 'secret' ,
    saveUninitialized :true , 
    resave : false , 
    store : mongoStore.create( { mongoUrl : 'mongodb://127.0.0.1:27017/tech-vault' , mongoOptions : { useNewUrlParser : true , useUnifiedTopology : true }
     , collectionName : "sessionStore" }) , 
    cookie : {
        maxAge : 24 * 3600 * 1000 
    }
}))

//passport js 
app.use(passport.initialize())
app.use(passport.session())


app.use(flash())

app.get('*' , function(req , res , next ) {
    res.locals.user = req.user || null
    next()
})
//setting up routes

const userRoute = require('./routes/users')
const generalRoute = require('./routes/general')

app.use('/' , generalRoute)
app.use('/me' , userRoute)




//starting express server
app.listen(5000 , () => console.log("Up and running on 5000"))