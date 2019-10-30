const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const { ensureAuthenticated } = require('../config/auth')
const storage = multer.memoryStorage()
const AWS = require('aws-sdk');
require('dotenv').config()

const fields = [
    {name: 'displayName'},
    {name: 'image'}
  ]
const upload = multer({ storage: storage }).fields(fields);


let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: 'ap-southeast-2'
});
  

router.get('/edit-profile', async(req,res)=>{
    const populatedUser = await User.findOne({_id: req.user.id}).populate('profile')
    res.render('edit-profile', {
      user: populatedUser
    })
})
router.post('/edit-profile', upload, async(req,res, next)=>{

    if(req.body.displayName !== undefined){
        const myProfile = await Profile.findOne({user: req.user.id})
        myProfile.displayName = req.body.displayName;
        req.flash('success_edit', 'Profile Successfully Updated')
    }

    if(req.files.image !== undefined){
        const myProfile = await Profile.findOne({_id: req.user.profile.id})
        const { image } = req.files
        const uniqueValue = req.user.id 
        const key = Buffer.from(`${uniqueValue}${image[0].originalname}`).toString('base64')
        let fileParams = {
        Bucket: process.env.BUCKET,
        Body: image[0].buffer,
        Key: key,
        ACL: 'public-read',
        ContentType: image[0].mimetype
        }
        s3credentials.upload(fileParams, async (err, data) => {
        if (err) {
            res.send('you got an error')
        } else {
            const imageUrl = data.Location
            myProfile.displayImgLink = imageUrl
            await myProfile.save()
            
        }
        })
    }
    req.flash('success_edit', 'Profile Successfully Updated')
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })
})

router.get('/logout', (req,res)=>{
    req.logout()
    res.redirect('/users/login')
})

router.get('/edit-video', async (req,res)=>{
    const populatedUser = await User.findOne({_id: req.user.id}).populate('profile')
    passport.authenticate('local')
    res.render('edit-video', {
      user: populatedUser
    })
})

router.post('/edit-video', ensureAuthenticated, async (req,res)=>{
    const currentProfile = await Profile.findOne({user: req.user.id})
    req.body.videoLink = req.body.videoLink.split('v=')[1]
    currentProfile.backgroundVideoLinks.push(req.body)
    await currentProfile.save()
    res.redirect('/dashboard')
})

module.exports = router;