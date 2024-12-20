const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String
  });
  
  module.exports =  mongoose.model('User', UserSchema);