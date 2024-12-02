const { ApiClient, AddDetailView } = require('recombee-api-client');

// Initialize the Recombee API client
const client = new ApiClient(
  'staywise-dev', // Replace with your Recombee database ID
  'X6Buh2ESu5iIpudR70bOvgXXcS2TSgxeSyvzjOy0Jf4Cv7RTyyzmPrx1GBqsr50C', // Replace with your Recombee private token
  { region: 'eu-west' }
);

const logUserInteraction = async () => {
  if (user && motelId) {
    try {
      console.log('Logging interaction with:', { userId: user.id, motelId }); // Debugging log
      await axios.post('http://localhost:5000/log-interaction', {
        userId: user.id,
        motelId,
      });
      console.log('Interaction logged successfully for motel:', motelId);
    } catch (error) {
      console.error('Error logging interaction:', error.response?.data || error.message);
    }
  } else {
    console.error('Missing user or motelId:', { user, motelId });
  }
};


module.exports = { logUserInteraction };
