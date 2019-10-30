const mongoose = require('mongoose')
const Schema = mongoose.Schema

const profileSchema = new Schema({
    displayName: {
        type: String,
        required: true
    },
    backgroundVideoLinks:[{
        videoTitle: String,
        videoLink: String
    }],
    activeLink: String,
    tasks: [{type: Schema.Types.ObjectId, ref: 'Task'}],
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    friends: [{type: Schema.Types.ObjectId, ref: 'Profile'}],
    displayImgLink: {
        type: String,
        required: false,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS4RHDL6Bs9E6cpHDChkzD48PJdBPUVDq6P9kjJ8HfBSTPm6W7W"
    }

}) 

const Profile = mongoose.model('Profile', profileSchema)
module.exports = Profile