const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campgrounds')
const Review = require('./models/review.js');



//middleware section 51 to prevent taking actions prior to logging on.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line for returnTo
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


//more middleware for server side validation
module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//section 52 setting up auth
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    //add below lines in section 52 to find id and then determine auth
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to take that action!!!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//middleware for reviews to validate server side
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//section 52 setting up auth
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    //add below lines in section 52 to find id and then determine auth
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to take that action!!!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}