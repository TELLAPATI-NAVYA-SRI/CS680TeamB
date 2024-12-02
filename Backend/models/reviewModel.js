const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: String, // Stored directly for quick access
    motelId: {
      type: String, // Changed to String to match your `Motels` collection
      ref: 'Motel', // Optional: Keep this if you're using population for reference
    },
    ratings: {
      overall: { type: Number, required: true },
      ambiance: { type: Number, required: true },
      service: { type: Number, required: true },
      value: { type: Number, required: true },
      petFriendly: { type: Number, required: true },
      parking: { type: Number, required: true },
      cleanliness: { type: Number, required: true },
      roomComfort: { type: Number, required: true },
      dining: { type: Number, required: true },
      wifi: { type: Number, required: true },
      accessibility: { type: Number, required: true },
      childFriendly: { type: Number, required: true },
    },
    photos: [String], // Array of photo URLs
    reviewDesc: String,
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
