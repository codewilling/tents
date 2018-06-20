const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    passport = require("passport");

router.get("/", function (req, res) {
    res.render("landing");
});

//show register form
router.get("/register", (req, res) => {
    res.render("register", { page: 'register' });
});

//register a user
router.post("/register", (req, res) => {
    let newUser = new User(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
            username: req.body.username,
            email: req.body.email,
            isAdmin: req.body.adminAccessCode
        })
    if (req.body.adminAccessCode === 'junto214') {
        newUser.isAdmin = true;
    }
    else{
        newUser.isAdmin = false;
    }
    //passport method ".register()" will take the password field and create a hash to store in the DB
    //    
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register", { error: err.message })
        }
        passport.authenticate("local")(req, res, () => {
            req.flash('success', "Sign-up Successful! Welcome " + req.body.username + " !")
            res.redirect('/campgrounds');
        });
    })
});

//login a user
router.get("/login", function (req, res) {
    res.render("login", { page: 'login' });
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true
    }));

//logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", 'Logged you out!')
    res.redirect("/campgrounds");
});

module.exports = router;