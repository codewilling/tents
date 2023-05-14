const   cookieSession = require('cookie-session'),
        express       = require("express"),
        app           = express(),
        bodyParser    = require("body-parser"),
        mongoose      = require("mongoose"),
        passport      = require("passport"),
        flash         = require("connect-flash"),
        LocalStrategy = require("passport-local"),
        methodOverride = require("method-override")
        Campground    = require("./models/campground"),
        Comment       = require("./models/comment"),
        User          = require("./models/user");

const   commentRoutes    = require("./routes/comments"),
        campgroundRoutes = require("./routes/campgrounds"),
        indexRoutes      = require("./routes/index"),
        userRoutes       = require("./routes/users");

// seedDB();

require('dotenv').config();

mongoose.connect(`mongodb://mongo:sOLsxO3mlx3ur7iJT6n7@containers-us-west-130.railway.app:6455`, {useNewUrlParser: true, useUnifiedTopology: true}).then((result) => console.log('connected to db')).catch(err=>console.log(err));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
//flash needs to be declared before passport configuration
app.use(flash());

//PASSPORT CONFIGURATION

//express-session
app.use(require("express-session")({
    secret: "Maddie is the most adorable 3 year old",
    resave: false,
    saveUninitialized: false
}));

// client-session
 app.use(require("client-sessions")({
     cookieName: "session",
     secret: "Maddie is the most adorable 3 year old",
     duration: 5*60*1000
}))

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/users", userRoutes);


app.listen(process.env.PORT, function(){
    console.log("Open your client to port: " + process.env.PORT);
});