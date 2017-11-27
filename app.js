var express               = require("express"),
    mongoose              = require("mongoose"),
    bodyParser            = require("body-parser"),
    request               = require("request"),
    methodOverride        = require("method-override"),
    expressSanitizer      = require("express-sanitizer"),
    flash                 = require("connect-flash"),
    passport              = require("passport"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession        = require("express-session"),
    Campground            = require("./models/campground"),
    User                  = require("./models/user"),
    Comment               = require("./models/comment");
    app = express();

var campgroundRoutes = require("./routes/campgrounds");
var commentRoutes    = require("./routes/comments");
var authRoutes       = require("./routes/index");

var SALT_WORK_FACTOR = 10;

// FLASH
app.use(flash());

// CONFIGURE PASSPORT
app.use(expressSession({
  secret: "Everything happens for something!",
  resave: false,
  saveUnintialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// CONFIGURE APP
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// SET SERVER PORT
app.set('port', process.env.PORT || 8080);

// CONFIGURE MONGOOSE
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url);

// PASSPORT SETUP
passport.use(new localStrategy(User.authenticate()));

// PASSPORT serialize and deserialize
// This lets the User to serialize and deserialize
// while saving the user info into the express session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// CONFIGURE ROUTES
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(authRoutes);

app.listen(app.get('port'), function(){
  console.log("Express up and running on port "+app.get('port'));
});

console.log("CONNECTED!");
