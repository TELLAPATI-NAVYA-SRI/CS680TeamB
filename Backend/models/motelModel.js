const mongoose = require('mongoose');

const motelSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Unique Yelp ID
  alias: String,
  name: String,
  image_url: String,
  is_closed: Boolean,
  url: String,
  review_count: Number,
  categories: [
    {
      alias: String,
      title: String
    }
  ],
  rating: Number,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  transactions: [String],
  price: String,
  location: {
    address1: String,
    address2: String,
    address3: String,
    city: String,
    zip_code: String,
    country: String,
    state: String,
    display_address: [String]
  },
  phone: String,
  display_phone: String,
  distance: Number,
  business_hours: [
    {
      open: [
        {
          is_overnight: Boolean,
          start: String,
          end: String,
          day: Number
        }
      ],
      hours_type: String,
      is_open_now: Boolean
    }
  ],
  attributes: mongoose.Schema.Types.Mixed // Flexible for nested and optional attributes
});

module.exports = mongoose.model('Motel', motelSchema, 'motels');
