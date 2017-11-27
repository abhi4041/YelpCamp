var mongoose = require("mongoose");

// SETUP COMMENTS SCHEMA
var commentsSchema = new mongoose.Schema({
  author: String,
  content: String
});

module.exports = mongoose.model("Comment", commentsSchema);
