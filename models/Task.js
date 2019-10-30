const mongoose = require('mongoose')
const Schema = mongoose.Schema


const taskSchema = new Schema({
    taskTitle: {type: String, required: true},
    taskImportance: {type: String, required: true},
    taskLength: {type: String, required: true},
    completionStatus: {type: Boolean, default:false}
})

const Task = mongoose.model('Task', taskSchema)
module.exports = Task