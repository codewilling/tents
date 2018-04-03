const express = require("express"),
      router = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment = require("../models/comment");

//SHOW form for creating a comment
router.get("/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, result){
        err
        ? console.log(err)
        : res.render("comments/new", {campgroundsval: result});
    })
});

//POST comment form with a redirect
router.post("/", isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds/:id");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    return console.log(err)
                } else{
                    //add username and _id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    //connect new comment to campground
                    campground.comments.push(comment._id);
                    campground.save();
                    //redirect to campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    })
});

//EDIT COMMENT ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            return res.redirect("/campgrounds/" + req.params.id)
        }else{
            return res.render("comments/edit", {comment: foundComment, campground_id: req.params.id})
        }
    })
})

//UPDATE COMMENT ROUTE
router.put("/:comment_id", checkCommentOwnership, function(req,res){
    let newComment = req.body.comment ;
    let comment = req.params.comment_id ;
    Comment.findByIdAndUpdate(comment, newComment, function(err, updatedComment){
        if(err){
            res.redirect("/campgrounds/" + req.params.id)
        }else{
            res.redirect("/campgrounds/" + req.params.id)
        }

    })
})

//DESTROY COMMENT ROUTE
router.delete("/:comment_id", checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("/campgrounds/" + req.params.id)
        }
        res.redirect("/campgrounds/" + req.params.id)
    })
})


function isLoggedIn(req, res, next){
    //passport method .isAuthenticated()
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err){
                res.redirect("/campgrounds/" + req.params.id)
            }else{
                if(comment.author.id.equals(req.user._id)){
                    return next();
                }else{
                    res.redirect("/campgrounds/" + req.params.id)
                }
            }
        })
    }
}

module.exports = router;
