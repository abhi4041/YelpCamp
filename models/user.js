var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// SETUP USER SCHEMA
var userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema); // This creates a collection 'users'
