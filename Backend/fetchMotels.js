const axios = require('axios');
const fs = require('fs');

// Your Yelp API Key
const API_KEY = 'YWUH0L6Pk33_MXuwUiI72ANO4Ta-3grnd4eOnVxHdFYDY7D0HvcTTA00j3tumVcJ2FaKnxOISxi9xKm_v4kSFEfWIUaCV5Kfao2BttynwD73GZt3NepuoRyKJic4Z3Yx'; // Replace with your API key
const BASE_URL = 'https://api.yelp.com/v3/businesses/search';

// List of US States
const STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
];

// Fetch motels for a state with pagination
const fetchMotelsForState = async (state, offset = 0) => {
    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${API_KEY}`
            },
            params: {
                location: state,
                categories: 'hotels',
            
            },
            timeout: 10000 // Increase timeout to 10 seconds
        });
        return response.data.businesses;
    } catch (error) {
        console.error(`Error fetching motels for ${state} (offset ${offset}):`, error.response?.data || error.message);
        return [];
    }
};

// Main function to fetch motels for all states
const fetchAllMotels = async () => {
    const allMotels = [];
    const motelIds = new Set(); // To track unique motel IDs

    for (const state of STATES) {
        console.log(`Fetching motels for ${state}...`);
        let offset = 0;
        let hasMore = true;

        while (hasMore && offset < 240) { // Limit offset to 240
            const motels = await fetchMotelsForState(state, offset);

            // Add unique motels to the final dataset
            motels.forEach((motel) => {
                if (!motelIds.has(motel.id)) {
                    motelIds.add(motel.id); // Track the motel ID
                    allMotels.push(motel);
                }
            });

            if (motels.length > 0) {
                offset += 50; // Fetch the next page
            } else {
                hasMore = false;
            }
        }
    }

    return allMotels;
};

// Run the script
fetchAllMotels()
    .then((motels) => {
        console.log(`Fetched ${motels.length} unique motels.`);
        fs.writeFileSync('motels.json', JSON.stringify(motels, null, 2));
        console.log('Saved motels data to motels.json.');
    })
    .catch((err) => {
        console.error('Error:', err.message);
    });
