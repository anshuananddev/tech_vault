const express = require('express')
const validator = require('validator')

const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({

    title : {
        type : String , 
        required : [true , "Title field is required"] , 
        trim : true ,
        minlength : [5 , "Title should have atleast 5 letters"]

    } , 

    description : {
        type : String , 
        required : [true , "Description field is required"]  , 
        trim : true , 
    } , 

    downloadedBy : [{ 
        type : String
     }] , 

    downloadNumber :{ type : Number , default : 0} ,

    owner : {
        type : mongoose.Types.ObjectId , 
        required : true , 
        
    } , 

    techstack : String , 

    tags : String , 

    uploadedGridFileId : mongoose.Types.ObjectId


} , {
    timestamps : true
})

const Projects = mongoose.model('Projects',projectSchema)

module.exports = Projects