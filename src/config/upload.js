const multer = require('multer')
const gridfsStorage = require('multer-gridfs-storage').GridFsStorage
const gridfsStream = require('gridfs-stream')

const storage = new gridfsStorage( {
    url : 'mongodb://localhost:27017/techv-uploads' , 
    options : { useNewUrlParser : true , useUnifiedTopology : true  } ,
    file : (req , file) => {
        if(file.mimetype === 'application/pdf') {
            return {
                filename : file.originalname , 
                bucketName : 'projectPdfs'
            }
        }
        else{
            throw new Error(`${file.mimetype} is not allowed`)
        }
    }
})

upload = multer({
    storage 
})

const uploadAvatar = multer({
    limits : {
        fileSize : 15000000
    } ,

    fileFilter(req , file , cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }

        cb(undefined , true)
    }
})

module.exports = {
    upload ,
    uploadAvatar
}