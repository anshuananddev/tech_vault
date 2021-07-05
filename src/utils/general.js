const { body , validationResult } = require('express-validator')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const Token = require('../models/tokenModel')
const flash = require('connect-flash')
const crypto = require('crypto')
const bcrypt = require('bcrypt') 
const sgMail = require('@sendgrid/mail')
const fs=require("fs")
const path=require("path")
const Project = require('../models/projectModel')
const { handlebars } = require('hbs')
const { findById } = require('../models/projectModel')

// Regex function for search functionality
// const escapeRegex = (string) => {
//     return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
//   };

module.exports = { signupHandler : async (req , res) => {
    try {
        var vError = validationResult(req)
        if(!vError.isEmpty()){
            formattedError = {}
            vError = vError.mapped()
            for(var field in vError){
                formattedError[field] = vError[field].msg
            }
            
            // console.log(formattedError)
            
            return res.render('signup' ,{
                warnings : formattedError})      //this need to be shown on signup page using template engine 
            //res.render('signup' , vError)
        }

        var user = new User({
            name : req.body.name ,
            email : req.body.email ,
            password : req.body.password ,

        })

        await user.save()

        req.flash('success' , "SignUp successful ! Login now ")
        res.redirect('/')
          //render it on signup page at the top (like showig success msg )

    }catch(err) {
        console.log(err.name)

        // console.log(err instanceof mongoose.ValidationError)
        // console.log(err instanceof ValidatorError)

        if(err.name == 'ValidationError') {
            formattedError = {}

            for(efield in err.errors){
                formattedError[efield] = err.errors[efield].properties.message 
            }

        //console.log(formattedError)   // return example :- { name: 'Change Name', password: 'Password must contain 8 characters' } , use it to show alert on signup page
        
        
            return res.render('signup' , {
                warnings : formattedError
            }) //from here alert message should be shown if something goes wrong in user.save() , render it on signup page 
        }

        return res.render('signup' , {
            error : "Internal server error ! Try again later ."
        })

    }


} , 

loginHandler : async ( req, res ) =>{

    var vError = validationResult(req)
    
    if(!vError.isEmpty()){
        console.log(vError)
        vError = vError.mapped()
        console.log(vError)
        formattedError ={}
        for(var field in vError){
            formattedError[field] = vError[field].msg }

        console.log(formattedError)
        return res.render('login' , {
            warnings : formattedError
        }) // te required , SSR
    }

    req.flash('success' , "Logged In") 
    res.redirect('/')//SSR

    
} ,

requestPassReset : async (req , res ) => {
    const email = req.body.email 

    const user = await User.findOne({ email })

    if(!user){
       return res.render('password' , {
           error : "Email does't exists"
       })
    }

    var token = await Token.findOne({ userId : user._id })
    if(token) await token.deleteOne()

    var resetToken = crypto.randomBytes(32).toString('hex')
    const hash = await bcrypt.hash(resetToken , Number(8))

    await new Token({
        userId : user._id , 
        token : hash , 
        createdAt : Date.now()
    }).save()

    const apikey = process.env['API_KEY2']

    sgMail.setApiKey(apikey)

    const template="../../templates/views/clientMail.hbs"
    const source=fs.readFileSync(path.join(__dirname,template), "utf8")
    const compiledTemplate=handlebars.compile(source)

    sgMail.send({
        to: email,
        from: process.env['FROM'],
        subject:"Password Reset",
        html: compiledTemplate({
            name: user.name,
            link: `localhost:5000/resetPassword?token=${resetToken}&id=${user._id}`
        })
    })
    return res.render('password' , {
        success : "Email has been sent !"
    })
},

resetPassword : async (req, res)=>{
    const userId = req.query.id
    const token = req.query.token
    console.log(req.query)
    console.log("userid = " ,typeof userId)
    const password = req.body.newpassword
    const confirmPassword=req.body.confirmpassword

    if(password!==confirmPassword){
        return res.render('reset' , {
            error : "Password does not match ."
        })
    }
    
    const passwordResetToken = await Token.findOne({userId})
    if(!passwordResetToken){
        return res.render('reset' , { error :"Inavalid or Expired Password Reset Token"})
    }
    const hash = await bcrypt.hash(password, Number(8))
    await User.updateOne({_id: userId},{$set: { password: hash}}, {new: true})

    const user = await User.findById({_id: userId});

    const apikey = process.env['API_KEY2']

    sgMail.setApiKey(apikey)

    const template="../../templates/views/clientSuccess.hbs"
    const source=fs.readFileSync(path.join(__dirname,template), "utf8")
    const compiledTemplate=handlebars.compile(source)

    sgMail.send({
        to: user.email,
        from: process.env['FROM'],
        subject: "Password Reset Successful",
        html: compiledTemplate({
            name: user.name,
        })
    })

    await passwordResetToken.deleteOne()

    req.flash('success' , "Password Reset Successful ! Login Now")
    return res.redirect('/')
} , 

search : async (req , res) => {
    const by = req.query.by
    const topic = req.query.topic
    // regex = new RegExp(escapeRegex(req.query.topic), 'gi')

    regex = ".*" + topic + ".*"
    var projects = []
    try{
    if(by){
        
         projects = await Project.find({ [by] : { $regex : regex , $options : 'gi'}}).sort({ createdAt : 1})
    }
    else{
         projects = await Project.find({ title : { $regex : regex , $options : 'gi'}}).sort({ createdAt : 1})
    }

    result = []
    
    // console.log(projects)
    if(projects.length !== 0) {
    projects.forEach(async (project) => {
        searchresult = {}
        searchresult.pid =( project.owner).toString()
        searchresult.title = project.title 
        var cat = project.createdAt
        searchresult.createdon = cat.getFullYear() + "/" + cat.getMonth() + "/" + cat.getDate()
        let user = await User.findById(project.owner)
        searchresult.name = user.name
        searchresult.tags = project.tags
        
        result.push(searchresult)
    }) 

    res.render('search' , {
        searchresults : result , 
        topic 
    }) }else {
        res.render('search' , {
            'info' : "No projects for your search topic" , 
            topic 
        })
    }

} catch(e){
    console.log(e)
    res.render('search' ,{
        error : "Unable to retrieve projects" , 
        topic : req.query.topic
    })
}

    

}

}