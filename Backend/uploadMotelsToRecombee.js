const mongoose = require('mongoose');
const Motel = require('./models/motelModel'); // Adjust path as necessary
const Recombee = require('recombee-api-client');
const { ApiClient } = Recombee;
const { SetItemValues, Batch } = Recombee.requests; // Correct import of request types

const client = new ApiClient('staywise-dev', 'X6Buh2ESu5iIpudR70bOvgXXcS2TSgxeSyvzjOy0Jf4Cv7RTyyzmPrx1GBqsr50C', {
  region: 'eu-west',
});

async function uploadMotelsToRecombee() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://user1:0826@cluster0.usrip.mongodb.net/StayWise?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Fetch motels from the database
    const motels = await Motel.find();
    console.log(`Fetched ${motels.length} motels`);
    

    // Prepare batch requests
    const requests = motels.map((motel) => {
      return new SetItemValues(
        motel.id,
        {
          name: motel.name,
          
          price: motel.price,
          city: motel.location?.city,
          state: motel.location?.state,
          latitude: motel.coordinates?.latitude,
          longitude: motel.coordinates?.longitude,
          accepts_credit_cards: motel.attributes?.business_accepts_credit_cards || false,
          accepts_apple_pay: motel.attributes?.business_accepts_apple_pay || false,
          free_wifi: motel.attributes?.wi_fi === "free",
          dogs_allowed: motel.attributes?.dogs_allowed || false,
        },
        { cascadeCreate: true } // Automatically create items if they don't exist
      );
    });

    // Debug the requests array
    console.log('Prepared requests:', requests);

    // Upload to Recombee
    await client.send(new Batch(requests));
    console.log('Motels successfully uploaded to Recombee!');
    client.send(new Recombee.requests.ListItems())
    .then((items) => {
        console.log(items); // This will display all the items in your database
    })
    .catch((error) => {
        console.error('Failed to fetch items:', error);
    });
  } catch (error) {
    console.error('Error uploading motels to Recombee:', error);
  } finally {
    mongoose.connection.close();
  }
}

uploadMotelsToRecombee();
