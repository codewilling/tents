const express    = require("express"),
      router     = express.Router(), 
      User       = require('../models/user'),
      Campground = require('../models/campground');

router.get('/:id', (req, res)=>{
    userId = req.params.id
    User.findById(userId, (err, user)=>{
        if(err){
            console.log(err);
            req.flash('error', {error: err.message});
            return res.redirect('/campgrounds');
        }
        Campground.find().where('author.id').equals(user._id).exec((err, campground)=>{
            if (err){
                console.log(err)
                req.flash('error', {error: err.message});
                return res.redirect('/');
            }
            console.log(user);
            res.render("users/show", {user: user, campgrounds: campground});
        })   
    })
});

module.exports = router;
