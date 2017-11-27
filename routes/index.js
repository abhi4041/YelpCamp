var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User     = require("../models/user");
var flash    = require("connect-flash");

// DEFAULT ROUTE
router.get("/", function(req, res){
  res.render("landing");
});

// LOGIN ROUTE
router.get("/login", function(req, res){
  res.render("login");
});

router.post("/login", passport.authenticate("local",
                    {
                      successRedirect: "/campgrounds",
                      failureRedirect: "/login"
                    }),
                  function(req, res){
});

// SIGNIN ROUTE
router.get("/signin", function(req, res){
    res.render("signin");
});

// POST ROUTE for SIGNIN
router.post("/signin", function(req, res){
  if(req.body.password == req.body.confirmPassword) {
    // Create a new user document into users collection
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
      if(err) {
        req.flash("error", err.message);
        return res.render("signin");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/profile");
        });
      }
    });
  } else {
    req.flash("error", "Password and confirmPassword are mismatching!");
    res.redirect("/signin");
  }
});

// PROFILE GET ROUTE
router.get("/profile", isLoggedIn, function(req, res){
    res.render("profile");
});

// EDIT ROUTE for PROFILE
router.get("/profile/:id/edit", isLoggedIn, function(req, res){
  User.findOne({_id : req.params.id}, function(err, user){
    if(err)
      res.redirect("/campgrounds");
    else {
      res.render("profEdit", {user : user});
    }
  });
});

// POST EDIT ROUTE for PROFILE
router.post("/profile/:id/edit", isLoggedIn, function(req, res){
  User.findByIdAndUpdate(req.params.id, req.body.user, {new: true}, function(err, updatedUser){
    if(err)
      res.redirect("/profile/req.params.id/edit");
    else {
      res.render("profile", {user: updatedUser});
    }
  });
});

// LOGOUT ROUTE
router.get("/logout", function(req, res){
  req.flash("success", req.user.username+"! Logged out");
  req.logout(); // Destroys the session info on the server
  res.redirect("/campgrounds");
});

// MIDDLEWARE for User login
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
      return next();
    req.flash("error", "Please login first!");
    res.redirect("/login");
}

module.exports = router;
