const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');



// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

// Middleware
const cors = require('cors');
app.use(cors());



const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Express setup


app.use(express.urlencoded({ extended: true }));

// S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload file to S3 and return URL
const uploadFileToS3 = async (file) => {
  const key = `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`;
  const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype // Set ContentType for proper file handling
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};



// MongoDB Connection String (from .env)
const mongostring = process.env.MONGO_URI 

mongoose.connect(mongostring, {
  
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging indefinitely
});

const database = mongoose.connection;

// MongoDB Event Listeners
database.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
  process.exit(1); // Exit the app on connection failure
});

database.once('connected', () => {
  console.log('Database connected');
});

//Loading Models
const Motel = require('./models/motelModel');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');


// Posting a review with photos
app.post('/reviews', upload.array('photos'), async (req, res) => {
  try {
    // Upload all photos and get their URLs
    const photoURLs = await Promise.all(
      req.files.map((file) => uploadFileToS3(file))
    );

    // Extract review data from request body
    const {
      userId,
      username,
      motelId,
      overall,
      ambiance,
      service,
      value,
      petFriendly,
      parking,
      cleanliness,
      roomComfort,
      dining,
      wifi,
      accessibility,
      childFriendly,
      reviewDesc,
    } = req.body;

    console.log('Received data:', req.body);
    console.log('Files:', req.files);

    // Validate `motelId` as a non-empty string
    if (!motelId || typeof motelId !== 'string') {
      return res
        .status(400)
        .json({ message: 'Invalid motelId. It must be a non-empty string.' });
    }

    // Validate ratings (1-5)
    const categories = {
      overall,
      ambiance,
      service,
      value,
      petFriendly,
      parking,
      cleanliness,
      roomComfort,
      dining,
      wifi,
      accessibility,
      childFriendly,
    };

    for (const [key, value] of Object.entries(categories)) {
      if (value < 1 || value > 5) {
        return res
          .status(400)
          .json({ message: `${key} rating must be between 1 and 5.` });
      }
    }

    
    // Save review information, including photo URLs, to the database
    const review = new Review({
      userId,
      username,
      motelId,
      ratings: categories,
      photos: photoURLs,
      reviewDesc,
    });

    const savedReview = await review.save();

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Failed to upload files:', error);
    res.status(500).json({ message: 'Failed to post review', error: error.message });
  }
});


app.get('/reviews/photos/:motelId', async (req, res) => {
  try {
    const { motelId } = req.params;
    const reviews = await Review.find({ motelId }, 'photos'); // Fetch only photos field
    const photos = reviews.flatMap((review) => review.photos); // Extract all photo URLs
    
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Failed to fetch photos' });
  }
});

app.get('/reviews/summary/:motelId', async (req, res) => {
  const { motelId } = req.params;

  try {
    const reviews = await Review.find({ motelId });

    if (!reviews.length) {
      return res.json({ overallRating: 0, reviewCount: 0 });
    }

    // Calculate average overall rating
    const totalRating = reviews.reduce((acc, review) => acc + (review.overall || 0), 0);
    const overallRating = (totalRating / reviews.length).toFixed(1); // Round to 1 decimal

    // Return average overall rating and review count
    res.json({
      overallRating: Number(overallRating),
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews summary:', error);
    res.status(500).json({ message: 'Failed to fetch reviews summary' });
  }
});



app.get('/reviews/averages/:motelId', async (req, res) => {
  const { motelId } = req.params;

  try {
    const reviews = await Review.find({ motelId });

    if (reviews.length === 0) {
      return res.json({ averages: {} });
    }

   

    const averages = {
      overall: 0,
      ambiance: 0,
      service: 0,
      value: 0,
      petFriendly: 0,
      parking: 0,
      cleanliness: 0,
      roomComfort: 0,
      dining: 0,
      wifi: 0,
      accessibility: 0,
      childFriendly: 0,
    
    };

    for (const category of Object.keys(averages)) {
      
      const sum = reviews.reduce((acc, review) => {
        
        const value = Number(review.ratings[category]) || 0; // Fallback to 0 if undefined
        return acc + value;
      }, 0);
    
      averages[category] = (sum / reviews.length).toFixed(1);
    }
    

    
    res.json({ averages, reviewCount: reviews.length  });
  } catch (error) {
    console.error('Error fetching averages:', error);
    res.status(500).json({ message: 'Failed to fetch averages' });
  }
});


app.get('/reviews/:motelId', async (req, res) => {
  const { motelId } = req.params;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 5; // Reviews per page
  const skip = (page - 1) * limit;

  try {
    const totalReviews = await Review.countDocuments({ motelId });
    const reviews = await Review.find({ motelId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ reviews, totalReviews, currentPage: page, totalPages: Math.ceil(totalReviews / limit) });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});


app.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).send({ message: "Email already exists!" });
    }
    
    const user = new User(req.body);
    
    await user.save();
    res.status(201).send({ message: "User created successfully", user: user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({ message: "Error creating user", error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).send({ message: "Username/Email and password are required." });
  }

  try {
    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Compare the provided password with the stored password (plain-text comparison)
    if (password !== user.password) {
      return res.status(401).send({ message: "Invalid password." });
    }

    // Respond with success and user details (excluding the password)
    res.status(200).send({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName:user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal server error", error: error.message });
  }
});





// POST a new review
app.post('/reviews', async (req, res) => {
  try {
    const { userId, username, motelId, rating, photos, reviewDesc } = req.body;
    const review = new Review({
      userId,
      username,
      motelId,
      rating,
      photos, // Assuming photos are URLs
      reviewDesc
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: 'Error saving review', error: error.message });
  }
});


// Example Route
app.get('/getmotels', async (req, res) => {
    try {
        const motels = await Motel.find();
        
        
      //console.log(`Number of motels found: ${motel.length}`);
      res.json(motels);
    } catch (error) {
      console.error('Error fetching motels:', error.message);
      res.status(500).json({ error: 'Failed to fetch motels' });
    }
})

app.get('/motel/:id', async (req, res) => {
  try {
    
    const motelId = req.params.id; // Get the motel ID from the URL
    const motel = await Motel.findOne({ id: motelId }); // Query the database by the motel ID field
    

    if (!motel) {
      return res.status(404).json({ error: 'Motel not found' });
    }

    res.json(motel); // Send motel details as JSON
  } catch (err) {
    console.error('Error fetching motel:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/motels', async (req, res) => {
  const { state } = req.query;

  // Validate required query parameters
  if ( !state) {
    return res.status(400).json({ error: 'state are required.' });
  }
  
  try {
    // Query the database for motels in the specified city and state
    const motels = await Motel.find({
      // Case-insensitive match
      'location.state': new RegExp(`^${state}$`, 'i'), // Case-insensitive match
    });


    // Return the motels or a message if no results are found
    if (motels.length === 0) {
      return res.status(404).json({ message: `No motels found in  ${state}` });
    }

    res.json(motels);
  } catch (error) {
    console.error('Error fetching motels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/locationSearch', async (req, res) => {
  const { city, state } = req.query;

  // Debugging log
  console.log("City:", city, "State:", state);

  // Ensure at least one of city or state is provided
  if (!city && !state) {
    return res.status(400).json({ error: 'At least one of city or state is required.' });
  }

  // Build the query dynamically
  const query = {};

  if (city) {
    query['location.city'] = new RegExp(`^${city}$`, 'i'); // Case-insensitive match for city
  }
  if (state) {
    query['location.state'] = new RegExp(`^${state}$`, 'i'); // Case-insensitive match for state
  }

  // Log the constructed query for debugging
  console.log("Query:", query);

  try {
    const motels = await Motel.find(query);

    if (motels.length === 0) {
      return res.status(404).json({ message: `No motels found for the given city and/or state.` });
    }

    res.json(motels);
  } catch (error) {
    console.error('Error fetching motels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const Recombee = require('recombee-api-client');
const { ApiClient } = Recombee;

const { AddDetailView, Batch } = Recombee.requests;

const client = new ApiClient('staywise-dev', 'X6Buh2ESu5iIpudR70bOvgXXcS2TSgxeSyvzjOy0Jf4Cv7RTyyzmPrx1GBqsr50C', {
  region: 'eu-west',
  requestTimeout: 5000, // Increase timeout to 5 seconds (or more if needed)
});


app.post("/log-interaction", async (req, res) => {
  const { userId, action, motelIds } = req.body;
  console.log(req.body)

  if (!userId || !action || !motelIds || motelIds.length === 0) {
    return res.status(400).json({ message: "User ID, Action, and Motel IDs are required" });
  }

  try {
    const requests = motelIds.map((motelId) =>
      new AddDetailView(userId, motelId, { cascadeCreate: true })
    );

    await client.send(new Batch(requests));
    res.status(200).json({ message: "Interactions logged successfully" });
  } catch (error) {
    console.error("Error logging interaction:", error);
    res.status(500).json({ message: "Failed to log interaction" });
  }
});
app.post("/log-one-interaction", async (req, res) => {
  const { userId, motelId } = req.body;
  console.log(req.body)

  if (!userId || !motelId) {
    return res.status(400).json({ message: "User ID,  and Motel IDs are required" });
  }

  try {
    const requests =
      new AddDetailView(userId, motelId, { cascadeCreate: true })
    

    await client.send(requests);
    res.status(200).json({ message: "Interactions logged successfully" });
  } catch (error) {
    console.error("Error logging interaction:", error);
    res.status(500).json({ message: "Failed to log interaction" });
  }
});


const { RecommendItemsToUser } = Recombee.requests;

app.get('/recommend-motels/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Use Recombee's API to fetch recommended items
    const recommendations = await client.send(
      new RecommendItemsToUser(userId, 3, {
        scenario: 'recommendation',
        cascadeCreate: true,
        requestTimeout: 10000,
      }) // Increase timeout to 10 seconds
    );
    const motelIds = recommendations.recomms.map((rec) => rec.id);
    const validMotels = await Motel.find({ id: { $in: motelIds } });

    res.status(200).json({ recomms: validMotels });

   
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});




app.post('/forgot-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's password in the database
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
