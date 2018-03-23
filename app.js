
const   express       = require("express"),
        app           = express(),
        bodyParser    = require("body-parser"),
        mongoose      = require("mongoose"),
        passport      = require("passport"),
        LocalStrategy = require("passport-local"),
        methodOverride = require("method-override")
        Campground    = require("./models/campground"),
        Comment       = require("./models/comment"),
        User          = require("./models/user"),
        port          = 8000,
        seedDB        = require("./seeds");

const   commentRoutes    = require("./routes/comments"),
        campgroundRoutes = require("./routes/campgrounds"),
        indexRoutes      = require("./routes/index");

// seedDB();

mongoose.connect("mongodb://localhost/tents");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION

//express-session
app.use(require("express-session")({
    secret: "Maddie is the most adorable 3 year old",
    resave: false,
    saveUninitialized: false
}))

//client-session
// app.use(require("client-sessions")({
//     cookieName: "session",
//     secret: "Maddie is the most adorable 3 year old",
//     duration: 5*60*1000
// }))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);


app.listen(port, function(){
    console.log("Open your client to port: " + port);
});