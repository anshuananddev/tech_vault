const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({ 
    userId : {
        type : mongoose.Types.ObjectId , 
        required : [true , 'UserId is required'] ,
        ref : 'User'
    } ,

    token : {
        type : String , 
        required : true
    } , 

    createdAt : {
        type : Date ,
        required : true , 
        default : Date.now ,
        expires : 900
    }

})

const Token = mongoose.model('Token' , tokenSchema)

module.exports = Token