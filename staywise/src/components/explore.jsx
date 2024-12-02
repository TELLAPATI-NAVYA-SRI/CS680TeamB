import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/css/exploreStyle.css';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const [motels, setMotels] = useState([]); // Filtered motels (displayed list)
  const [originalMotels, setOriginalMotels] = useState([]); // Full list of motels
  const [currentPage, setCurrentPage] = useState(1);
  const motelsPerPage = 9; // Number of motels per page
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [location, setLocation] = useState({ city: null, state: null });
  const [locationQuery, setLocationQuery] = useState('');
  const [summary, setSummary] = useState({ overallRating: 0, reviewCount: 0 });
  const [averageRatings, setAverageRatings] = useState({});
  const [filters, setFilters] = useState({
    
    dogsAllowed: false,
    freeWifi: false,
    acceptsApplePay: false,
    acceptsCreditCard: false,
  });
  const [sortBy, setSortBy] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData"));
  

  
  
  const logInteraction = async (action, motelIds) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userData")).id;
  
      if (!userId || !motelIds || motelIds.length === 0) {
        console.error("Missing required fields for logging interaction.");
        return;
      }
  
      const payload = { userId, action, motelIds };
  
      const response = await axios.post("http://localhost:5000/log-interaction", payload);
      
    } catch (error) {
      console.error("Error logging interaction:", error);
    }
  };
  

const [recommendedMotels, setRecommendedMotels] = useState([]);

const fetchRecommendations = async (userId, city, state) => {
  try {
      console.log(city,state)
      const response = await axios.get(`http://localhost:5000/recommend-motels/${userId}`);
      setRecommendedMotels(response.data.recomms);
      console.log(recommendedMotels)
  } catch (error) {
      console.error('Failed to fetch recommendations:', error);
  }
};

// Fetch recommendations on component mount or when user changes
useEffect(() => {
  console.log(location)
  if (location.city || location.state || user) {
      fetchRecommendations(user.id, location.city, location.state);
  }
}, [location]);

  
  
  


  // Fetch location and motels on component mount
 // Mapping of state names to abbreviations
  const stateNameToAbbreviation = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west Virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
  };

  useEffect(() => {
    const fetchLocation = async (latitude, longitude) => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        

        // Get city and full state name
        const { city, state } = response.data.address;

        // Convert full state name to abbreviation
        const stateAbbreviation = stateNameToAbbreviation[state.toLowerCase()] || state;

        setLocation({ city, state: stateAbbreviation });

        // Fetch motels for the detected state
        fetchMotels(stateAbbreviation);
        
      } catch (err) {
        console.error(err);
        setError('Unable to fetch location details.');
      }
    };

    const fetchMotels = async (state) => {
      try {
        
        const response = await axios.get(`http://localhost:5000/motels?state=${state}`);
        // Fetch average ratings for each motel
        const ratings = {};
        for (const motel of response.data) {
          const ratingResponse = await axios.get(`http://localhost:5000/reviews/averages/${motel.id}`);
          ratings[motel.id] = ratingResponse.data;
          
        }
        setAverageRatings(ratings);
        setMotels(response.data);
        setOriginalMotels(response.data);
        
      } catch (err) {
        console.error(err);
        setError('Unable to fetch motels for your location.');
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchLocation(latitude, longitude);
        },
        () => {
          setError('Geolocation permission denied. Please allow access to your location.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);


  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if(locationQuery==='')
    {
      
    }
    else{
    const location = locationQuery || `${location.city}, ${location.state}`;
    let [city = "", state = ""] = location.split(",").map((part) => part.trim());
    let stateAbbreviation = stateNameToAbbreviation[state.toLowerCase()] || state;
    console.log("city :"+city.toLowerCase(),"state: "+state.toLowerCase())
  
    if (!state && stateNameToAbbreviation[city.toLowerCase()]) {
      stateAbbreviation = stateNameToAbbreviation[city.toLowerCase()];
      city = "";
    }
    
    try {
      const response = await axios.get(
        `http://localhost:5000/locationSearch?state=${stateAbbreviation}&city=${city}`
      );
      
      setLocation({ city, state: stateAbbreviation });
      setMotels(response.data);
      setOriginalMotels(response.data);
  
      // Log interaction
      const motelIds = response.data.map((motel) => motel.id);
      logInteraction("search-by-location", motelIds);
    } catch (err) {
      console.error("Error fetching motels:", err);
      setError("Unable to fetch motels for the specified location.");
    }}
  };
  
  

  
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  
    const filteredMotels = query
      ? originalMotels.filter((motel) => motel.name.toLowerCase().includes(query))
      : originalMotels;
  
    setMotels(filteredMotels);
    setCurrentPage(1); // Reset to the first page
  
    // Log interaction
    const motelIds = filteredMotels.map((motel) => motel.id);
    logInteraction("search-by-name", motelIds);
  };
  

  

  const handleFilterByPrice = (price) => {
    const newPriceFilter = priceFilter === price ? "" : price; // Toggle filter
    setPriceFilter(newPriceFilter);

    let filteredMotels = originalMotels

    if (filters.dogsAllowed ) {
      filteredMotels = filteredMotels.filter((motel) => motel.attributes.dogs_allowed);
    }
    if (filters.freeWifi) {
      filteredMotels = filteredMotels.filter((motel) => motel.attributes.wi_fi === 'free');
    }
    if (filters.acceptsApplePay) {
      filteredMotels = filteredMotels.filter((motel) => motel.attributes.business_accepts_apple_pay); // Assuming this attribute exists
    }
    if (filters.acceptsCreditCard) {
      filteredMotels = filteredMotels.filter((motel) => motel.attributes.business_accepts_credit_cards); // Assuming this attribute exists
    }
  
    filteredMotels = newPriceFilter
      ? filteredMotels.filter((motel) => motel.price === newPriceFilter)
      : filteredMotels;

    
    
    setMotels(filteredMotels);
    setCurrentPage(1); // Reset to the first page
    
  
    // Log interaction
    const motelIds = filteredMotels.map((motel) => motel.id);
    logInteraction("filter-by-price", motelIds);
  };
  

  // Handle checkbox filters
  const handleCheckboxChange = (filterName) => {
    setFilters((prevFilters) => {
      const updatedFilters = {
        ...prevFilters,
        [filterName]: !prevFilters[filterName], // Toggle the current filter
      };
  
      // Apply filters to motels
      let filteredMotels = originalMotels;
      
      if(priceFilter !== ''){
        filteredMotels =  filteredMotels.filter((motel) => motel.price === priceFilter)
      
      }
      
      if (updatedFilters.dogsAllowed ) {
        filteredMotels = filteredMotels.filter((motel) => motel.attributes.dogs_allowed);
      }
      if (updatedFilters.freeWifi) {
        filteredMotels = filteredMotels.filter((motel) => motel.attributes.wi_fi === 'free');
      }
      if (updatedFilters.acceptsApplePay) {
        filteredMotels = filteredMotels.filter((motel) => motel.attributes.business_accepts_apple_pay); // Assuming this attribute exists
      }
      if (updatedFilters.acceptsCreditCard) {
        filteredMotels = filteredMotels.filter((motel) => motel.attributes.business_accepts_credit_cards); // Assuming this attribute exists
      }
      
      // Log the interaction for applying the filter, including motel IDs
      const motelIds = filteredMotels.map((motel) => motel.id); // Extract motel IDs
      logInteraction(filterName, motelIds);
      // Update the motels list
      setMotels(filteredMotels);
  
      // Reset the current page
      setCurrentPage(1);
  
      return updatedFilters; // Update filters state
    });
  };
  

  // Handle sorting
  // const handleSort = (sortKey) => {
  //   setSortBy(sortKey);

  //   const sortedMotels = [...motels].sort((a, b) => {
  //     if (sortKey === 'rating') return b.rating - a.rating;
  //     if (sortKey === 'reviews') return b.review_count - a.review_count;
  //     return 0;
  //   });

  //   setMotels(sortedMotels);
  // };

  // Pagination logic
  const indexOfLastMotel = currentPage * motelsPerPage;
  const indexOfFirstMotel = indexOfLastMotel - motelsPerPage;
  const currentMotels = motels.slice(indexOfFirstMotel, indexOfLastMotel);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(motels.length / motelsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const truncateText = (text, wordLimit) =>
    text
      ? text.split(' ').slice(0, wordLimit).join(' ') + '...'
      : 'N/A';

  const handleCardClick = (motelId) => {
    navigate(`/motel/${motelId}`); // Navigate to the motel details page
  };

  // // Error handling
  // if (error) {
  //   return <div className="error">{error}</div>;
  // }

  return (
    <div className="container">
      {/* Sidebar for Filters */}
      <div className="sidebar">
        <h4>Filters</h4>
        <h5>Price</h5>
        <div className="price-filters">
          {['$', '$$', '$$$', '$$$$'].map((price) => (
            <button
              key={price}
              className={priceFilter === price ? 'selected' : ''}
              onClick={() => handleFilterByPrice(price)}
            >
              {price}
            </button>
          ))}
        </div>
        <div className="feature-checkboxes">
          {Object.keys(filters).map((filterName) => (
            <label key={filterName}>
              <input
                type="checkbox"
                checked={filters[filterName]}
                onChange={() => handleCheckboxChange(filterName)}
              />
              {filterName.replace(/([A-Z])/g, ' $1')} {/* Format name */}
            </label>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div>
      <div className="filter-container">
        {/* Search by Name */}
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search motels..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i> {/* Font Awesome search icon */}
        </div>

        {/* Search by Location */}
        
        <div className="search-wrapper-location">
          <input
            type="text"
            placeholder="Search motels by city, state..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="search-input-location"
          />
          <i
            className="fas fa-search search-icon"
            onClick={handleLocationSearch}
            
            title="Search by location" // Tooltip for accessibility
          ></i>
        </div>

        

        {/* Sort Dropdown */}
        {/* <select
          onChange={(e) => handleSort(e.target.value)}
          value={sortBy}
          className="sort-dropdown"
        >
          <option value="">Sort By</option>
          <option value="rating">Rating</option>
          <option value="reviews">Reviews</option>
        </select> */}
      </div>

      





        {/* Motel Cards */}
        <h3 style={{ paddingLeft: 50 }}>
            Motels near {location.state  || location.city||'your location'}
        </h3>

        <div className="card-container">
          {currentMotels.map((motel, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(motel.id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={motel.image_url || 'https://via.placeholder.com/150'} alt={motel.name} />
              <div className="card-content">
                <h2 className="title">{motel.name}</h2>
                <h5>
                  {truncateText(
                    motel.attributes.about_this_biz_history ||
                      motel.attributes.about_this_biz_specialties,
                    15
                  )}
                </h5>
                <p className="features">
                <strong>Rating:</strong> {averageRatings[motel.id]?.averages.overall || 'N/A'} ⭐ (
                  {averageRatings[motel.id]?.reviewCount || 0} reviews) <br />
                  <strong>Price:</strong> {motel.price || 'N/A'}<br />
                  <strong>Contact:</strong> {motel.display_phone || 'N/A'}<br />
                  <strong>Location:</strong> {motel.location.city}, {motel.location.state}{' '}
                  {motel.location.zip_code}
                </p>
              </div>
            </div>
          ))}
        </div>

        

        {/* Pagination */}
        <div className="pagination">
          <button className="movebutton" onClick={handlePrevPage} disabled={currentPage === 1}>
            &lt;
          </button>
          <span>
            {indexOfFirstMotel + 1}-{Math.min(indexOfLastMotel, motels.length)} of {motels.length}
          </span>
          <button
            className="movebutton"
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(motels.length / motelsPerPage)}
          >
            &gt;
          </button>
        </div>
        <div className="recommendations-section">
          {recommendedMotels.length > 0 && (
            <div>
              <h3 style={{paddingLeft:50}}>Recommended For You</h3>
            </div>
          )}
          <div className="card-container">
            {recommendedMotels.length === 0 ? (
              <></>
            ) : (
              recommendedMotels.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="card"
                  onClick={() => handleCardClick(recommendation.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={recommendation?.image_url || 'https://via.placeholder.com/150'}
                    alt={recommendation?.name || 'No Name Available'}
                  />
                  <div className="card-content">
                    <h2 className="title">{recommendation?.name || 'Unknown Motel'}</h2>
                    <p className="features">
                      
                      <strong>Price:</strong> {recommendation?.price || 'N/A'}<br />
                      <strong>Location:</strong> {recommendation?.location?.city || 'N/A'}, {recommendation?.location?.state || 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;