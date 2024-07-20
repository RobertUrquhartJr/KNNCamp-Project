const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    //index campgrounds for all campgrounds page
    .get(catchAsync(campgrounds.index))
    //also added isLoggedIn to this section 51
    // endpoint of new...post that new route will go.
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// new campgrounds route
// isLoggedIn added with middleware.js section 51 and imported above.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    //show page to include city/state details later
    .get(catchAsync(campgrounds.showCampground))
    //2nd layer of edit...method override 
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //initialize delete functionality.
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




//edit route that serves form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))











module.exports = router;