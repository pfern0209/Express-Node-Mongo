// if(process.env.NODE_ENV!=="production"){
//   require('dotenv').config()//gives access in process.env
// }

  require('dotenv').config()//gives access in process.env

const express=require ('express');
const app=express();
const path=require('path');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const mongoose = require('mongoose');
const methodOverride=require('method-override');
const session=require('express-session');
const flash=require('connect-flash')
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet')
const MongoStore = require('connect-mongo');
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp'
// process.env.DB_URL
// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: 'secret'
//     }
// });

// store.on("error",function(e){
//   console.log("Session store error",e)
// })
const secret=process.env.SECRET||'secret'
const sessionConfig={
  store:MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60
  }),
  name:'session',
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    // secure:true,
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7
  }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());//To prevent mongo injection
app.use(helmet())
// {contentSecurityPolicy:false}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwvdq6l5m/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use((req,res,next)=>{
  res.locals.currentUser=req.user;
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})

const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const userRoutes=require('./routes/users')

app.engine('ejs',ejsMate)
app.use(express.urlencoded({ extended: true }));//to parse body
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))



// 'mongodb://localhost:27017/yelp-camp'


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex:true,useFindAndModify:false})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
  console.log("Database Connected")
})

app.use('/campgrounds',campgroundRoutes)
app.use('/campground/:id/reviews',reviewRoutes)
app.use('/',userRoutes)

app.get('/',(req,res)=>{
  res.render('home')
})




app.all('*',(req,res,next)=>{
  next(new ExpressError('Page not found',404))
})

app.use((err,req,res,next)=>{
  const{statusCode=500}=err;
  if(!err.message) err.message='Oh No, Something went wrong'
  res.status(statusCode).render('error',{err})
})
const port=process.env.PORT||3000
app.listen(port,function(){
  console.log(`Listening at port ${port}`)
})