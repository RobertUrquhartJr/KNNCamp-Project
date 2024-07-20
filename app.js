if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session'); //section 49 added

const flash = require('connect-flash'); // section 49 added
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport'); //section 51
const LocalStrategy = require('passport-local'); //section 51
const User = require('./models/user'); //section 51
const dbUrl = process.env.DB_URL;
//const dbUrl = 'mongodb://127.0.0.1:27017/knn-camp';
//to deploy
const MongoStore = require('connect-mongo');



// "security" section
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//removed Joi after moving it to custom file.
//const Joi = require('joi');
//const { campgroundSchema, reviewSchema } = require('./schemas.js'); (restructuring section 49)
//const catchAsync = require('./utilities/catchAsync') (restructuring section 49)

//const Campground = require('./models/campgrounds') (restructuring section 49)
//const Review = require('./models/review') (restructuring section 49)





const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});

//'mongodb://127.0.0.1:27017/knn-camp'
// mongoose.connect('dbUrl', {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();

//ejs Mate used for styling added this video 434
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

//parse req.body for post req with new campgrounds.
app.use(express.urlencoded({ extended: true }))
//method override...
app.use(methodOverride('_method'));
//section 49, serving static assests
app.use(express.static(path.join(__dirname, 'public')));

//mongo injection "security"
app.use(mongoSanitize({ replaceWith: '_', }),);


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, //this is in seconds, not milliseconds
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

const sessionConfig = {
    store,
    name: 'notdefaultname',
    secret: 'thissecretsucksfornow',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 604800000, //in milliseconds (this is 1 week)
        maxAge: 604800000
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());


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
    "https://cdn.jsdelivr.net",
    "https://use.fontawesome.com/",
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
                "https://res.cloudinary.com/dkpfhejra/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);                //app.use(helmet({ contentSecurityPolicy: false })); //for now




//this is done section 51 for passport authentication
// make sure app.use(session()) is used before passport.session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//middleware for flash section 49
//section 51...middleware for current users
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


//this is done in section 49 with restructuring
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes);




app.get('/', (req, res) => {
    res.render('home')
});






app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found playboy...', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = ('Oh snap, something messed up along the way...')
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Kind kids chilling on port 3k')
});