//all the middleware goes here
let middlewareObj = {}

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, tent) {
            if (err) {
                req.flash('error', 'Campground not found')
                res.redirect("/campground/" + req.params.id);
            } else {
                if (tent.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', "You don't have permission to do that")
                    res.redirect("/campground/" + req.params.id);
                }
            }
        })
    } else {
        req.flash('error', 'You need to be logged in to do that!')
        //if not, redirect somewhere
        res.redirect("/campgrounds/" + req.params.id)
    }
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err || !comment) {
                req.flash('error', 'Comment not found')
                res.redirect("/campgrounds/" + req.params.id)
            } else {
                if (comment.author.id.equals(req.user._id)) {
                    return next();
                } else {
                    req.flash('error', "You don't have permission to do that")
                    res.redirect("/campgrounds/" + req.params.id)
                }
            }
        })
    } else {
        req.flash('error', 'You need to be logged in to do that!')
        //if not, redirect somewhere
        res.redirect("/campgrounds/" + req.params.id)
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to be logged in to do that!')
    res.redirect("/login")
}

module.exports = middlewareObj;