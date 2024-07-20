const express = require('express');
const router = express.Router({ mergeParams: true }); //use this to combine params to get id.

const Campground = require('../models/campgrounds')
const Review = require('../models/review')
const reviews = require('../controllers/reviews');


const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');



//reviews route
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//initialize delete on reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))



module.exports = router;