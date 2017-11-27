var express         = require("express");
var router          = express.Router();
var flash           = require("connect-flash");
var nodeGeoCoder    = require("node-geocoder");
var Campground      = require("../models/campground");
var order           = 0;
var lat             = "Yes";
var lng             = "No";
var latLng          = {lat: String, lng: String};

// GEO-CODER OPTIONS
var options = {
    provider :'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyCmUaV_5SpGbNN42GC6UdcuBwaE47xrYj8',
    formatter: null
};

// CAMPGROUND ROUTE
router.get("/campgrounds", function(req, res){
    Campground.find({}, function(err, campgrounds){
        if(err)
            console.log(err);
        else
            res.render("index", {campgrounds: campgrounds});
    });
});

// CREATE ROUTE
router.get("/campgrounds/new", isLoggedIn, function(req, res) {
    res.render("new");
});

// POST ROUTE
router.post("/campgrounds", function(req, res){
    Campground.create(req.body.campground, function(err){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", req.body.campground.name+" is created successfully!");
            res.redirect("/campgrounds");
        }
    });
});

// SHOW ROUTE
router.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err, campground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            // id field in mongodb is generated based on the date & time
            // So, sort the comments based on the id & latest comment
            // appears on the top
            if(req.query.order === undefined || req.query.order == 0) {
                campground.comments.sort(function (a, b) {
                    return (b._id.getTimestamp() - a._id.getTimestamp());
                });
            }
            var geocoder = nodeGeoCoder(options);
            geocoder.geocode(campground.location, function(err, result) {
                res.render("show", {campground: campground, order: req.query.order, lat: result[0].latitude, lng: result[0].longitude});
            });
        }
    });
});

// EDIT ROUTE
router.get("/campgrounds/:id/edit", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            res.render("edit", {campground: campground});
        }
    });
});

// UPDATE ROUTE
router.put("/campgrounds/:id", isLoggedIn, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, {new: true}).populate('comments').exec(function(err, updatedCampground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds/:id/edit");
        } else {
            res.render("show", {campground: updatedCampground, order : order});
        }
    });
});

// DELETE ROUTE
router.delete("/campgrounds/:id", isLoggedIn, function(req, res){
    Campground.remove({_id : req.params.id}, function(err){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Deleted campground!");
            res.redirect("/campgrounds");
        }
    });
});

// Google Maps API Key
// AIzaSyCmUaV_5SpGbNN42GC6UdcuBwaE47xrYj8

// MIDDLEWARE for User login
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next();
    req.flash("error", "Please login first!");
    res.redirect("/login");
}

module.exports = router;
