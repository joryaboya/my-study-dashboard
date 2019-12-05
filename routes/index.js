const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')
const User = require('../models/User')
const Profile = require('../models/Profile')
const taskJSON = require('../models/data/taskImportance.json')
const Task = require('../models/Task')

router.get('/', (req,res) =>{
    res.render('welcome')
})

router.get('/dashboard', ensureAuthenticated, async (req,res) =>{
    const populatedUser = await User.findOne({_id: req.user.id}).populate('profile')
    const currentProfile = await Profile.findOne({user: req.user.id}).populate('tasks')
    res.render('dashboard', {user: populatedUser, taskData: taskJSON, profile: currentProfile})
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})

router.post('/video-select', async (req,res)=>{
    const currentProfile = await Profile.findOne({user: req.user.id})
    const activeVideo = req.body.videoSelect
    currentProfile.activeLink = activeVideo
    await currentProfile.save()
    res.redirect('/dashboard')
})

router.post('/task-update', async(req,res)=> {
    const currentProfile = await Profile.findOne({user: req.user.id}).populate('tasks')
    const newTask = new Task({
        taskTitle: req.body.taskTitle,
        taskImportance: req.body.taskImportance,
        taskLength: req.body.taskLength
    })
    await newTask.save()
    currentProfile.tasks.push(newTask)
    await currentProfile.save()
    res.redirect('/dashboard')
})

router.post('/delete-task', async(req, res)=> {
    const deleteTask = await Task.findByIdAndRemove({_id: req.body.taskId})
    res.redirect('/dashboard')
    
})

module.exports = router