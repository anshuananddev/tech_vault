const { body, validationResult } = require('express-validator')
const mongoose = require('mongoose')
const User = require('../models/userModel')
const flash = require('connect-flash')
const sharp = require('sharp')
const Project = require('../models/projectModel')
const { uploadAvatar } = require('../config/upload')
const gridfsStream = require('gridfs-stream')


module.exports = {
    addprojectHandler: async (req, res) => {
        var b = req.body
        var title = b.title
        var description = b.description
        var techstack = b.techstack
        var tags = b.tags



        const owner = req.user._id



        if (!req.file) {
            // console.log("Inside checking if file is on req.file")
            req.flash('warnings', ['You need to upload a PDF file'])

            return res.redirect('/me/addproject')
        }

        var uploadedGridFileId = req.file.id

        projectData = {
            title,
            description,
            owner,
            techstack,
            tags,

            uploadedGridFileId
        }


        var project = new Project(projectData)


        try {

            await project.save()

            // req.flash('success' , formattedError)
            return res.redirect('/me/myproject')

        } catch (err) {
            console.log(err)
            if (err.name == "ValidationError") {
                formattedError = []

                for (efield in err.errors) {
                    formattedError.push(err.errors[efield].properties.message)
                }

                console.log("FormattedError :  ", formattedError)
                req.flash('warnings', formattedError)
                res.redirect('/me/addproject')
            }
        }

    },

    addprojectErrorHandler: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            req.flash('error', 'Upload Error')
            return res.redirect('/me/addproject')
        }

        if (err.name == "Error") {
            req.flash('error', err.message)
            return res.redirect('/me/addproject')
        }

        req.flash('error', 'Some error occured ! Try again later')
        return res.redirect('/me/addproject')
    },

    //  UPDATE PROFILE
    updateMe: async (req, res) => {


        if (req.body.name == "") {
            req.flash('warnings', ["Invalid or Empty Name"])
            return res.redirect('/me/profile')
        }

        if (req.body.type == "Professional") {
            if (req.body.exp > 40) {
                req.flash('warnings', ["Experience data may be fake"])
                return res.redirect('/me/profile')
            }

        }


        const updates = Object.keys(req.body)


        try {


            if (req.file) {
                const buffer = await sharp(req.file.buffer).resize({ width: 260, height: 209 }).png().toBuffer()
                req.user.avatar = buffer
            }

            updates.forEach((update) => {
                if (update == 'type') {
                    req.user.userType.type = req.body.type
                }

                else if (update == 'exp' || update == 'expertise' || update == 'role') {
                    if (update == 'expertise') req.user.userType.description[update] = req.body[update]

                    req.user.userType.description[update] = req.body[update]
                }

                else {

                    if (update == 'aointerest') {
                        req.user.aointerest = req.body.aointerest
                    }


                    req.user[update] = req.body[update]
                }
            })

            await req.user.save()

            req.flash('success', "Updated")
            res.redirect('/')
        } catch (e) {

            console.log(e)
            req.flash('error', "Not updated ! Try Again")
            return res.redirect('/me/profile')
        }
    },

    updateMeMulterErrorHandler: (err, req, res, next) => {
        req.flash('error', err.message)
        return res.redirect('/me/profile')
    },

    getprofile: async (req, res) => {
        const user = req.user

        const name = user.name
        const about = user.about
        const aointerest = user.aointerest

        const type = user.userType.type
        const exp = user.userType.description.exp
        const expertise = user.userType.description.expertise
        const role = user.userType.description.role
        var src = null
        if (user.avatar) {
            src = "data:image/png;base64," + user.avatar.toString('base64')
            // src = user.avatar.
        }

        var data = {
            user,
            name,
            about,
            exp,
            role,
            src,
            error: req.flash('error'),
            warnings: req.flash('warnings'),
            success: req.flash('success')

        }

        if (type == "Student") {
            data[type] = true
        }

        if (type == "Professional") data[type] = true
        if (aointerest)
            aointerest.forEach((interest) => {
                data[interest] = true
            })

        if (expertise)
            expertise.forEach((exp) => {
                data[exp] = true
            })

        // console.log(data)


        res.render('profile', data)
    },

    getmyproject: async (req, res) => {

        if (req.query.ownsearch) {
            const topic = req.query.ownsearch

            regex = ".*" + topic + ".*"
            var projects = []
            try {
                 
                projects = await Project.find({ title: { $regex: regex, $options: 'gi' } , owner : req.user._id }).sort({ createdAt: 1 })
                result = []

                // console.log(projects)
                if (projects.length !== 0) {
                    projects.forEach(async (project) => {
                        searchresult = {}
                        searchresult.pid = (project.owner).toString()
                        searchresult.title = project.title
                        var cat = project.createdAt
                        searchresult.createdon = cat
                        let user = await User.findById(project.owner)
                        searchresult.name = user.name
                        searchresult.tags = project.tags

                        result.push(searchresult)
                    })

                    return res.render('myproject', {
                        resultprojects : result,
                        topic ,
                        search : true
                    })
                } else {
                    return res.render('myproject', {
                        'info': "No projects for your search topic",
                        topic , 
                        search : true
                    })
                }

            } catch (e) {
                //console.log(e)
                return res.render('myproject', {
                    error: "Unable to retrieve projects",
                    topic: req.query.topic ,
                    search : true
                })
            }
        }

        const user = req.user
        owner = user._id
        try {
            var projects = await Project.find({ owner }).limit(5)

            formattedProjects = []

            if (projects.length !== 0) {
                projects.forEach((project) => {
                    singleproject = {}

                    singleproject.title = project.title
                    singleproject.createdon = project.createdAt
                    singleproject.tags = project.tags
                    singleproject.nodownloads = project.downloadNumber || 0
                    singleproject.pid = (project._id).toString()

                    formattedProjects.push(singleproject)

                })

                return res.render('myproject', {
                    user: req.user,
                    resultprojects: formattedProjects,
                    error: req.flash('error')
                })
            }

            return res.render('myproject', {
                info: "No Project Yet ! Go to Add Project"
            })


        } catch (e) {

            res.render('myproject', {

                error: "Some error in retrieving projects"
            })

        }


    },

    download: async (req, res) => {
        var id = req.params.pid
        id = mongoose.Types.ObjectId(id)

        const project = await Project.findById(id)


        const upid = project.uploadedGridFileId
        var uploads = mongoose.createConnection("mongodb://localhost:27017/techv-uploads", { useNewUrlParser: true, useUnifiedTopology: true })
        //console.log(uploads)

        uploads.once('open', async function () {
            var gfs = gridfsStream(uploads.db, mongoose.mongo)
            var readstream = gfs.createReadStream({
                _id: mongoose.Types.ObjectId(upid),
                root: "projectPdfs"
            })

            //console.log(readstream)
            res.set("Content-Disposition", "attachment ; filename=Project")
            readstream.pipe(res)
            //console.log(mongoose.Types.ObjectId(req.user._id )== mongoose.Types.ObjectId(project.owner))
            if ((req.user._id).toString()!= (project.owner).toString()) {
                project.downloadNumber++
                project.downloadedBy.push(req.user.name)
                await project.save()
            }
            
        })

        


    },

    view: async (req, res) => {

        var id = req.params.pid
        id = mongoose.Types.ObjectId(id)

        const project = await Project.findById(id)

        const upid = project.uploadedGridFileId
        var uploads = mongoose.createConnection("mongodb://localhost:27017/techv-uploads", { useNewUrlParser: true, useUnifiedTopology: true })
        //console.log(uploads)

        uploads.once('open', function () {
            var gfs = gridfsStream(uploads.db, mongoose.mongo)
            var readstream = gfs.createReadStream({
                _id: mongoose.Types.ObjectId(upid),
                root: "projectPdfs"
            })

            //console.log(readstream)
            res.set("Content-Type", "application/pdf")
            res.set("Content-Disposition", "inline")
            readstream.pipe(res)


        })
    },


    search: async (req, res) => {
        console.log("hittin /me/search")
        const by = req.query.by
        const topic = req.query.topic
        // regex = new RegExp(escapeRegex(req.query.topic), 'gi')

        regex = ".*" + topic + ".*"
        var projects = []
        try {
            if (by) {

                projects = await Project.find({ [by]: { $regex: regex, $options: 'gi' }, owner: { $ne: req.user._id } }).sort({ createdAt: 1 })
            }
            else {
                projects = await Project.find({ title: { $regex: regex, $options: 'gi' }, owner: { $ne: req.user._id } }).sort({ createdAt: 1 })
            }

            result = []

            // console.log(projects)
            if (projects.length !== 0) {
                projects.forEach(async (project) => {
                    searchresult = {}
                    searchresult.pid = (project._id).toString()
                    searchresult.title = project.title
                    var cat = project.createdAt
                    searchresult.createdon = cat.getFullYear() + "/" + cat.getMonth() + "/" + cat.getDate()
                    let user = await User.findById(project.owner)
                    searchresult.name = user.name
                    searchresult.tags = project.tags

                    result.push(searchresult)
                })

                res.render('search', {
                    searchresults: result,
                    topic,
                    user: req.user
                })
            } else {
                res.render('search', {
                    'info': "No projects for your search topic",
                    topic,
                    user: req.user
                })
            }

        } catch (e) {
            console.log(e)
            res.render('search', {
                error: "Unable to retrieve projects",
                topic: req.query.topic,
                user: req.user
            })
        }

    }
}