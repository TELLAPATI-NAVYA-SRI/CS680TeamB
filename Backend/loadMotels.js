const mongoose = require('mongoose');
const fs = require('fs');
const Motel = require('./models/motelModel'); // Assuming you save the schema as motelModel.js

// MongoDB connection URI
const MONGO_URI = 'mongodb+srv://user1:0826@cluster0.usrip.mongodb.net/StayWise';

// Connect to MongoDB
mongoose.connect(MONGO_URI, )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Load motels.json
const loadMotels = async () => {
  try {
    const data = JSON.parse(fs.readFileSync('motels.json', 'utf-8')); // Read motels.json
    console.log(`Loaded ${data.length} motels from file.`);

    // Insert data into MongoDB
    const insertedMotels = await Motel.insertMany(data, { ordered: false });
    console.log(`Inserted ${insertedMotels.length} motels into the database.`);
  } catch (error) {
    console.error('Error loading motels:', error.message);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

loadMotels();
