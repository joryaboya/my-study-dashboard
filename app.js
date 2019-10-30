const app = require('express')();
const expressLayouts = require('express-ejs-layouts')
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const morgan = require('morgan')
const {connectDB} = require('./config/db')
const cors = require('cors');
require('./config/passport')(passport)
const MongoStore = require('connect-mongo')(session);


//middleware

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(morgan('dev'))


app.use(express.json())
app.use(express.urlencoded({extended: false}))

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
// }))
app.use(session({
  store: new MongoStore({ url: process.env.MONGOURI })
}));

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.success_edit = req.flash('success_edit')
  next()
})
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())

//db initialised
connectDB()

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/profile', require('./routes/profile'))
app.use(express.static(__dirname + '/public'));

app.listen(3000, () => {
  console.log("Listening on Port 3000")
})
