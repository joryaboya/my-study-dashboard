//DB Connection
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGOURI, {useUnifiedTopology: true, useNewUrlParser: true}, (err, success) => {
        if (err) { console.error(err)}
        else {
          console.log('Connection Status: Success');
        }
      })
    }
    catch(err) {
      console.log(err)
    }
  }
module.exports ={
    connectDB
}