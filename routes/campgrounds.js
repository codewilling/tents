const express = require("express"),
      router = express.Router(),
      Campground = require("../models/campground");
      middleware = require("../middleware");
      
//INDEX route
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, site){
        if(err){
            console.log(err);
        } else{
            res.render("../views/campgrounds/index", {campgroundsval: site});
        }
    })
});

//CREATE route
router.post("/", middleware.isLoggedIn,function(req, res){
    //get data from form and add to campgrounds array
    let name = req.body.name;
    let price = req.body.price;
    let image = req.body.image;
    let description = req.body.description;
    let author = {
                    id : req.user._id,
                    username: req.user.username
                 };

    let newCampground  = {name: name, price: price, image: image, description: description, author: author};
    // create a new campground and save to DB
    Campground.create(newCampground, function(err, newSite){
        if(err){
            console.log(err);
        } else {
            console.log(newSite);
            //redirects are GET methods by default, so it will be a GET route
            res.redirect("/campgrounds");   
        }
    })
});

//NEW route, shows a form
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new", {campgroundsval: res});
});

//SHOW route, displays a selected item from the INDEX route
router.get("/:id", function(req, res){
    //retrieve the selected item
    let campsite = req.params.id
    Campground.findById(campsite)
    .populate("comments")
    .exec()
    .then(function(tent,err){
        if(err || !tent){
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }else{
            //show the show page with the selected item
            return res.render("campgrounds/show", {campgroundsval: tent});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, tent){
        res.render("campgrounds/edit", {campgroundView: tent})
    })
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds/" + req.params.id);
        }
            res.redirect("/campgrounds")
    })
})

module.exports = router;