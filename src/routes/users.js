const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const gridfsStorage = require('multer-gridfs-storage').GridFsStorage
const gridfsStream = require('gridfs-stream')

const User = require('../models/userModel')
const Project = require('../models/projectModel')
const auth = require('../middlewares/auth')
const reqValidation = require('../utils/reqValidation')
const { upload , uploadAvatar }= require('../config/upload')
const handlers = require('../utils/userUtils')



const router = express.Router()

// GET Add project
router.get('/addproject' , auth.ensureAuthenticated , async (req , res)=> {
    
    res.render('uploadProject' , {
        user : req.user , 
        error : req.flash('error') , 
        warnings : req.flash('warnings') ,
        success : req.flash('success')
        
    })
})


// POST Add Project
//project is the name attr of input[file]
router.post('/addproject' , reqValidation.validate('addproject') , auth.ensureAuthenticated ,upload.single('project') ,
 handlers.addprojectHandler , handlers.addprojectErrorHandler
)

//update User from dashboard
router.post('/update' , reqValidation.validate('updateMe') , auth.ensureAuthenticated , uploadAvatar.single('avatar') , 
handlers.updateMe , handlers.updateMeMulterErrorHandler )


// GET dashboard 
router.get('/profile' , auth.ensureAuthenticated , handlers.getprofile )

//delete User
router.get('/deleteme' ,auth.ensureAuthenticated , async (req, res) => {
    try {

        req.session.destroy()
        await req.user.remove()
        res.redirect('/') // home Page
    }catch(e) {
        req.flash('error' , "Error in deleting user")
        res.redirect('/me/profile') // dashboard showing error msg
    }
})

//delete Project
// pass project id to myprojects aand hide it within some p tag
router.get('/deleteproject/:projectid' , auth.ensureAuthenticated , async (req , res ) => {
    try{

        const id = req.params.projectid
        console.log("id pf project for deleting" , id)
        await Project.deleteOne({_id : mongoose.Types.ObjectId(id) })
        res.redirect('/me/myproject') //myprojects page with new outputs 
    }catch(e){
        //req.flash('error' , "Error deleting project")
        res.redirect('/') //myProjects
    }
})

//LOGOUT user
router.get('/logout' , auth.ensureAuthenticated , async (req , res) => {
    req.session.destroy()
    res.redirect('/')
})

// Download project Router
router.get('/download/:pid' , auth.ensureAuthenticated , handlers.download)

// Inline View Router
router.get('/view/:pid' , auth.ensureAuthenticated , handlers.view)


router.get('/myproject' , auth.ensureAuthenticated , handlers.getmyproject)


//authenticatedsearch
router.get('/search' , auth.ensureAuthenticated , handlers.search)





module.exports = router

