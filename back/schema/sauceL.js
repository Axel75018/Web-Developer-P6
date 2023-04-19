const mongoose = require('mongoose');
constbcrypt = require('bcrypt');


const sauceLSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  });

module.exports = mongoose.model('SauceL', sauceLSchema);