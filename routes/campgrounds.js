const express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder'),
    multer = require('multer');

let storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
let imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter })

let cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'juntola',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

let geocoder = NodeGeocoder(options);

//INDEX route
router.get("/", function (req, res) {
    if (req.query.search) {
        Campground.find({}, function (err, site) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", { campgroundsval: site, page: 'campgrounds' });
            }
        })
    }
    //Get all campgrounds from DB
    Campground.find({}, function (err, site) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgroundsval: site, page: 'campgrounds' });
        }
    })
});

//CREATE route
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    geocoder.geocode(req.body.campground.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        cloudinary.uploader.upload(req.file.path, function (result) {
            // add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            }
            const lat = data[0].latitude;
            const lng = data[0].longitude;
            const location = data[0].formatAddress;;
            // create a new campground and save to DB
            Campground.create(req.body.campground, function (err, newSite) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                } else {
                    console.log(newSite);
                    //redirects are GET methods by default, so it will be a GET route
                    res.redirect('/campgrounds/' + campground.id);
                }
            })
        })
    })
});

    //NEW route, shows a form
    router.get("/new", middleware.isLoggedIn, function (req, res) {
        res.render("campgrounds/new", { campgroundsval: res });
    });

    //SHOW route, displays a selected item from the INDEX route
    router.get("/:id", function (req, res) {
        //retrieve the selected item
        let campsite = req.params.id
        Campground.findById(campsite)
            .populate("comments")
            .exec()
            .then(function (tent, err) {
                if (err || !tent) {
                    req.flash("error", "Campground not found");
                    return res.redirect("/campgrounds");
                } else {
                    //show the show page with the selected item
                    return res.render("campgrounds/show", { campgroundsval: tent });
                }
            });
    });

    // EDIT CAMPGROUND ROUTE
    router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
        Campground.findById(req.params.id, function (err, tent) {
            res.render("campgrounds/edit", { campgroundView: tent })
        })
    });

    // UPDATE CAMPGROUND ROUTE
    // router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    //     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
    //         if (err) {
    //             res.redirect("/campgrounds");
    //         } else {
    //             res.redirect("/campgrounds/" + req.params.id)
    //         }
    //     })
    // });

    // UPDATE CAMPGROUND ROUTE
    router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash('error', 'Invalid address');
                return res.redirect('back');
            }
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;

            Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully Updated!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        });
    });


    //DESTROY CAMPGROUND ROUTE
    router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
        Campground.findByIdAndRemove(req.params.id, function (err) {
            if (err) {
                res.redirect("/campgrounds/" + req.params.id);
            }
            res.redirect("/campgrounds")
        })
    })

    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    module.exports = router;