const express = require('express')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const User = require('../models/userModel')
const Project = require('../models/projectModel')
const reqValidation = require('../utils/reqValidation')
const handlers = require('../utils/general')
const auth = require('../middlewares/auth')
const passport = require('passport')
const flash = require('connect-flash')

const router = express.Router()




router.get('/' , async (req, res) => {
    const projects = await Project.find()
    noofprojects = projects.length
    const users = await User.countDocuments()
    
    var downloads = 0
    projects.forEach( async (project)=> {
        downloads+= (project.downloadNumber)
    })
    

    res.render("index" , {
        success : req.flash('success') , 
        error : req.flash('error') ,
        warnings : req.flash('warnings') , 
        user : req.user ,
        nofprojects : noofprojects,
        nofuploads : noofprojects ,
        nofdownloads : downloads ,
        nofusers : users 
    })
})
router.get('/login' , async (req, res) => {
    res.render("login" , {
        error : req.flash('loginerror') 
    })
})

router.get('/signup' , async (req, res) => {
    res.render("signup" , {

    })
})

router.post('/signup' ,reqValidation.validate('signup')  , handlers.signupHandler)

router.post('/login' , reqValidation.validate('login') , passport.authenticate('local' , { failureRedirect : '/login' , failureFlash : true }) 
, handlers.loginHandler )

router.get('/requestPassReset' , async (req , res)=> {
    res.render('password')
})

router.post('/requestPassReset' , handlers.requestPassReset)

router.get('/resetPassword' , (req , res) => {
    res.render("reset")
})

router.post('/resetPassword' , handlers.resetPassword)

// Search for unauthenticated users 
router.get('/search' , handlers.search)

module.exports = router

