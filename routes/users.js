const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Profile = require('../models/Profile')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()

const storage = multer.memoryStorage()
// Passport config
require('../config/passport')(passport)

//Login
router.get('/login', (req, res) => {
  res.render('login')
})

// Register Page
router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next)
})

// Register Handle
router.post('/register',  async (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []
  
    // Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({msg: 'Please fill in all fields'})
    }
    // Check passwords match
    if (password != password2) {
      errors.push({msg:"Passwords do not match"})
    }
    // Check password length
    if (password.length < 6) {
      errors.push({msg: "Password needs to be at least 6 characters"})
    }
    else{
      try{
        const user = await User.findOne({email:email})
        if(user){
          errors.push({msg: 'User already exists'})
          res.render('register', {
            errors, name, email, password, password2
          })
        }
        else{
          const salt = await bcrypt.genSalt(10) 
          const hash = await bcrypt.hash(password, salt)
          req.body.password = hash 
          const newUser = await User.create(req.body)
          req.flash('success_msg', 'You are now registered');
          
          req.login(newUser, (err) => {
            if (err) {
              res.redirect('/users/login')
            } else {
              res.redirect('/users/profile')
            }
          })
        }
      }
      catch(err){
        res.status(500).send(err)
      }
    }
})

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

router.get('/profile', async (req,res)=>{
  res.render('profile')
})

router.post('/profile', upload, async(req,res)=>{
  const { displayName } = req.body
  // console.log(req.file)
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
      res.send(err)
    } else {
      const imageUrl = data.Location
      const newProfile = new Profile({
        displayName: displayName,
        displayImgLink: imageUrl,
        user: req.user.id
      })
      // console.log(newProfile)
      // console.log(user)
      await newProfile.save()
      const updateUser = await User.findByIdAndUpdate({_id: req.user.id}, {profile: newProfile.id})
      await updateUser.save()
      res.redirect('/dashboard')
    }
  })
})



module.exports = router;