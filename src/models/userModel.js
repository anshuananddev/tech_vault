const express = require('express')
const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Project = require('./projectModel')
const Token = require('./tokenModel')

const userSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : true ,
        trim : true , 
        
    } , 

    email : {
        type : String  , 
        required : true , 
        trim : true , 
        unique : true ,
        validate : (value) => {
            if (!validator.isEmail(value)) {
                throw new Error("This is not a valid Email")
            }
        }

    } ,

    password : {
        type : String , 
        required : true , 
        minlength : [8 , "Password must contain 8 characters"] 
    } ,

    about :{
        type : String , 
        maxlength : [ 200 , "Not allowed more than 200 characters"] ,
        default : "Write Something"

    } ,

    aointerest :[ {
        type : String ,
    } ],

    admin : {
        type : Boolean , 
        default : false
    } , 

    userType : {
        type : {
            type : String , 
            default : "Student"
        } ,

        description : {
            //default : null ,
            exp : {
                type : Number ,
                default : 0 
                
            } ,

            expertise : [ { type : String }] ,

            role : {
                type : String , 
                //default : null
            }



        }
    } ,

    avatar : Buffer

} , {
    timestamps : true
})

userSchema.statics.findByCredentials = async function(email , password) {
    const user = await User.findOne({ email })
    console.log("Inside findBYcredentials")

    if(!user) {
        throw new Error("Invalid Credentials")
    }

    console.log("got user")

    const userPassword = user.password
    const isValid = await bcrypt.compare(password , userPassword)

    if(!isValid) {
        throw new Error("Invalid Credentials")
        
    }

    console.log("valid user and sending user")
    return user

}


userSchema.pre('save' ,  async function(next){ 

    const user = this

    if(user.isModified("password")){

    user.password = await bcrypt.hash(user.password , 8) 
    next()
    }
})

userSchema.pre('remove' , async function(next){
    const user = this 
    const allProject = await Project.find({ owner : user._id })
    await Project.deleteMany({
        owner : user._id
    })

    await Token.deleteMany({
        owner : user._id
    })

    const uploaddbConn = mongoose.createConnection('mongodb://localhost:27017/techv-uploads' , { useNewUrlParser : true , useUnifiedTopology : true  })

    uploaddbConn.once('open' , async function(){

        allProject.forEach(async (project) => {
            await uploaddbConn.collection('projectPdfs.files').deleteOne({ _id : project.uploadedGridFileId })
        })
    
        await uploaddbConn.close()
        next()
    })
    
})

const User =  mongoose.model('User',userSchema)

module.exports = User