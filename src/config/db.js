const mongoose = require('mongoose')

const connectionURL = 'mongodb://127.0.0.1:27017/tech-vault'



const conn = mongoose.connect(connectionURL , { useNewUrlParser : true , useUnifiedTopology : true , useCreateIndex : true } )

module.exports = conn