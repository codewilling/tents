const express = require("express"),
      router = express.Router(),
      User = require("../models/user"),
      passport = require("passport");

router.get("/", function(req, res){
    res.render("landing");
});

//show register form
router.get("/register", (req, res)=>{
    res.render("register")
});

//register a user
router.post("/register", (req, res)=>{
    let newUser = new User({username: req.body.username})
    //passport method ".register()" will take the password field and create a hash to store in the DB
    User.register(newUser, req.body.password, (err, user) =>{
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req, res, ()=>{
            res.redirect("/campgrounds");
        })
    })
})

//login a user
router.get("/login", function(req, res){
    res.render("login")
})

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds", 
        failureRedirect: "/login"
    }), (req,res)=>{

})

//logout
router.get("/logout", (req,res) =>{
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req, res, next){
    //passport method .isAuthenticated()
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}

module.exports = router;