const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  img: String,
  bio: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Profile', ProfileSchema);
