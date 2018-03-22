const express = require("express"),
      router = express.Router(),
      Campground = require("../models/campground");

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
router.post("/", function(req, res){
    //get data from form and add to campgrounds array
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let newCampground  = {name: name, image: image, description: description};
    // create a new campground and save to DB
    Campground.create(newCampground, function(err, newSite){
        if(err){
            console.log(err);
        } else {
            //redirects are GET methods by default, so it will be a GET route
            res.redirect("/campgrounds");
        }
    })
});

//NEW route, shows a form
router.get("/new", function(req, res){
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
        if(err){
            return console.log(err);
        }
            console.log(tent)
            //show the show page with the selected item
            return res.render("campgrounds/show", {campgroundsval: tent});
        
    });
});

//SHOW route, displays a selected item from the INDEX route
// router.get("/:id", function(req, res){
//     Campground.findById(req.params.id, function(err, campsite){
//         console.log(campsite)
//         if(err){
//             console.log(err);
//         } else {
//             campsite.populate({path: "comments"}, function(err, tent)
//             {
//                 console.log(tent)
//                 if(err)
//                 {
//                     console.log(err);
//                 } else {
//                     res.render("campgrounds/show", {campgroundsval: tent});
//                        }
//             })
//                }   
//     })
// })

function isLoggedIn(req, res, next){
    //passport method .isAuthenticated()
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

module.exports = router;