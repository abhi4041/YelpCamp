var express     = require("express");
var router      = express.Router();
var flash       = require("connect-flash");
var User        = require("../models/user");
var Campground  = require("../models/campground");
var Comment     = require("../models/comment");

// COMMENT ROUTE
router.get("/campgrounds/:id/comment", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      req.flash("error", err.message);
      res.redirect("/campgrounds");
    } else
      res.render("comment", {campground : campground});
  });
});


// SPECIFIC COMMENT DELETE ROUTE
router.delete("/campgrounds/:id/comment/:commentid", isLoggedIn, function(req, res){
  Campground.findById(req.params.id).exec(onCampgroundFind);

  // This is just to make sure that this campground exists
  // can redirect back to this campground after a comment
  // is deleted
  function onCampgroundFind(err, campground){
    if(err)
      res.redirect("/campgrounds");
    else {
      // Now find the comment and delete the comment
      Comment.findById(req.params.commentid, onCommentFind);

      // Delete only if the same user has delete privilege
      function onCommentFind(err, comment) {
        if(err){
          req.flash("error", err.message);
          res.redirect("/campgrounds/"+req.params.id);
        } else {
          if(req.user.username == comment.author) {
            comment.remove(function(err){
              if(err){
                req.flash("error", err.message);
                res.redirect("/campgrounds/"+req.params.id);
              } else {
                req.flash("success", "Successfully deleted comment!");
                res.redirect("/campgrounds/"+req.params.id);
              }
            });
          }
          else {
            req.flash("error", "You don't have permission to delete this comment!");
            res.redirect("/campgrounds/"+req.params.id);
          }
        }
      }
    }
  }
});

// SPECIFIC COMMENT ROUTE
router.get("/campgrounds/:id/comment/:commentid", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err)
      res.redirect("/campgrounds");
    else
      Comment.findById(req.params.commentid, function(err, comment){
        // if(comment.author == req.user.username) {
          if(err)
            res.redirect("/campgrounds/"+req.params.id);
          else
            res.render("commentEdit", {campground : campground, comment : comment});
        // } else {
        //     res.redirect("/campgrounds/"+req.params.id);
        // }
      });
  });
});

// SPECIFIC COMMENT EDIT ROUTE
router.put("/campgrounds/:id/comment/:commentid", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err)
      res.redirect("/campgrounds");
    else {
      Comment.findById(req.params.commentid, function(err, comment){
        if(err)
          res.redirect("/campgrounds/"+req.params.id);
        else {
          if(comment.author == req.user.username) {
            comment.content = req.body.comment.content;
            comment.save(function(err){
              if(err) {
                req.flash("error", err.message);
                res.redirect("/campgrounds/"+req.params.id);
              } else {
                req.flash("success", "Successfully edited the comment!");
                res.redirect("/campgrounds/"+req.params.id);
              }
            });
          }
          else {
            req.flash("error", "You don't have permission to edit this comment!");
            res.redirect("/campgrounds/"+req.params.id);
          }
        }
      });
    }
  });
});


// POST COMMENT ROUTE
router.post("/campgrounds/:id/comment", isLoggedIn, function(req, res){
  var newComment = new Comment({
    author: req.user.username,
    content: req.body.comment.content
  });
  newComment.save();
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      res.redirect("/campgrounds");
    } else {
      Campground.update({_id: campground._id},
                        {$push: {comments: newComment}},
                        {new: true},
                        function(err) {
                          if(err) {
                            req.flash("error", err.message);
                            res.redirect("/campgrounds/"+campground.id);
                          } else {
                            req.flash("success", "Comment posted!");
                            res.redirect("/campgrounds/"+campground.id);
                          }
                        }
      );
    }
  });
});

// MIDDLEWARE for User login
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
      return next();
    req.flash("error", "Please Login First!");
    res.redirect("/login");
}

module.exports = router;
