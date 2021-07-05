const { body } = require("express-validator")
const User = require('../models/userModel')

exports.validate = (method) => {
  switch (method) {
    case 'signup': {
     
     return [ 
        body('name', 'Invalid name').exists().notEmpty().trim(),

         body('email', 'Invalid email').exists().isEmail().trim().custom(async (value) =>{
            const user = await User.findOne( { email : value})

            if(user){
                throw new Error("Email address has already been registered")
            }
               
             return true 
        })
        ,

        body('password' , "Invalid password").exists().notEmpty() ,

        body('confirmPassword').custom((value , { req }) => {
                

                if(value !== req.body.password) {
                    
                    throw new Error("Passwords don't match")
                }

                 return true
            
            
        })

       ]   
    } 

    case 'login' : {
        
        return [
            body('email' , 'Invalid email').exists().notEmpty() ,
            body('password' , 'Empty Password').exists().notEmpty()

        ]
    }

    case 'addproject' : {

      return [
        body('title' , ).exists().notEmpty().trim() ,
        body('description' , 'Provide description').exists().notEmpty().trim() , 
        body('techstack' , "Provide atleast one Tech Stack of your project").exists().notEmpty().trim() ,
        body('tag' , "Provide atleast one tag for your project").exists().notEmpty().trim()
      ]
    } 

    case 'updateMe' : {
      return [
        body('name', 'Invalid name').exists().notEmpty().trim()
        


      ]
    }
  }
}