import React from "react";
import "../components/css/motelDetail.css";
import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';



const MotelDetail = ({ match }) => {
  const { id } = useParams(); // Use the useParams hook to get the motel ID from the URL
  const [motel, setMotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState({}); // Store retrieved photos
  const [showPhotosModal, setShowPhotosModal] = useState(false); // Modal visibility
  const [currentIndex, setCurrentIndex] = useState(0); // Track current photo index

  const [averages, setAverages] = useState({});
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [reviewCount,SetReviewCount]=useState(0);

  const navigate = useNavigate();

  
  const user = JSON.parse(localStorage.getItem('userData')); // Get logged-in user data

 

  const fetchMotel = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/motel/${id}`);
      setMotel(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching motel:", err);
      setError("Failed to load motel details.");
      setIsLoading(false);
    }
  };

  const fetchAverages = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reviews/averages/${id}`);
      setAverages(response.data.averages);
      SetReviewCount(response.data.reviewCount)
      console.log(averages.overall)
      
    } catch (error) {
      console.error("Error fetching averages:", error);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      const response = await axios.get(`http://localhost:5000/reviews/${id}?page=${page}`);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  const logInteraction = async () => {
    if (!user || !id) {
      console.error("Missing user or motel ID for logging interaction");
      return;
    }
  
    try {
      console.log("Logging interaction with data:", { userId: user.id, motelId: id, action: "view" });
      const response = await axios.post('http://localhost:5000/log-one-interaction', {
        userId: user.id,  // Ensure this is valid
          // Specify the action
        motelId: id,      // Ensure this is valid
      });
      console.log('Interaction logged successfully:', response.data);
    } catch (error) {
      console.error('Error logging interaction:', error.response?.data || error.message);
    }
  };
  
  useEffect(() => {
    fetchMotel();
    fetchAverages();
    fetchReviews();
    logInteraction();
  }, [id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(page);
  };

  
  

  const fetchPhotos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reviews/photos/${id}`);
      setPhotos(response.data); // This updates the photos state asynchronously
      setShowPhotosModal(true); // Show modal after fetching photos
      
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to load photos.");
    }
  };
  
  // Log `photos` whenever it changes
  useEffect(() => {
    if (photos.length > 0) {
      
    }
  }, [photos]);
  


  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!motel) {
    return <div>Motel not found.</div>;
  }

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get the current day and time
  const currentDay = new Date().getDay();
  const currentTime = parseInt(new Date().toTimeString().slice(0, 5).replace(":", ""), 10); // Convert to HHMM format

  // Format time for display (e.g., "0630" -> "6:30 AM")
  const formatTime = (time) => {
    if (time === "0000") return "12:00 AM";
    const hour = parseInt(time.slice(0, 2), 10);
    const minute = time.slice(2);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour > 12 ? hour - 12 : hour || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  // Check if the business is open now for the current day
  const isOpenNow = (openHours) => {
    const todayHours = openHours.filter((hours) => hours.day === currentDay);
    for (const hours of todayHours) {
      const start = parseInt(hours.start, 10);
      const end = parseInt(hours.end, 10);

      // Handle cases where the end time is midnight (0000)
      if (start === 0 && end === 0) return true; // Open 24 hours
      if (start <= currentTime && (end > currentTime || end === 0)) {
        return true;
      }
    }
    return false;
  };
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const openNow = motel.business_hours?.[0]?(motel.business_hours?.[0]?.is_open_now || isOpenNow(motel.business_hours[0]?.open)) : "";
  const displayAttributes = [
    {
      key: "business_accepts_apple_pay",
      label: "Accepts Apple Pay",
      icon: "🍎", // Replace with an actual icon if needed
    },
    {
      key: "business_accepts_credit_cards",
      label: "Accepts Credit Cards",
      icon: "💳",
    },
    {
      key: "dogs_allowed",
      label: "Dogs Allowed",
      icon: "🐾",
    },
    {
      key: "wi_fi",
      label: "Wi-Fi",
      icon: "📶",
    },
  ];

  const navigateToReviewPage = () => {
    navigate(`/reviewPage/${id}`); // Correct usage to navigate
  };
  return (
    <div className="motel-detail">
      {/* Hero Section */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${motel.image_url})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{motel.name}</h1>
          {(motel.attributes.about_this_biz_year_established !== null) ? (
            <h5>Since {motel.attributes.about_this_biz_year_established}</h5>) : ""}
          <div className="rating">
          {Array(5)
            .fill(null)
            .map((_, index) => {
              const fullStars = Math.floor(averages.overall); // Number of fully filled stars
              const isHalfStar = averages.overall - fullStars >= 0.5 && index === fullStars; // Check for half star

              return (
                <span
                  key={index}
                  style={{
                    fontSize: "20px",
                    color: index < fullStars ? "gold" : "#ccc", // Full stars in gold
                    position: "relative",
                  }}
                >
                  {index < fullStars ? "★" : isHalfStar ? (
                    <span
                      style={{
                        background: "linear-gradient(90deg, gold 50%, #ccc 50%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      ★
                    </span>
                  ) : (
                    "★"
                  )}
                </span>
              );
            })}

            <span>({reviewCount} reviews)</span>
          </div>
          <ul>
            {Array.isArray(motel.categories) ? (
              motel.categories.map((category, index) => (
                <li key={index}>{category.title || 'Unknown Category'}</li>
              ))
            ) : (
              <li>No categories available</li>
            )}
          </ul>
          
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button className="action-button" onClick={navigateToReviewPage}>☆ Write a review</button>
        <button className="action-button" onClick={fetchPhotos}>View Photos</button>
        
        
        <a
          className="action-book"
          href={motel.attributes.business_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book Now
        </a>
      </div>

      {/* Information Row */}
      <div className="info-row">
        {/* Operating Hours */}
        <div className="info-section operating-hours">
          <h3>Operating Hours</h3>
          <ul>
            {Array.isArray(motel.categories) ? (
              motel.categories.map((category, index) => (
                <li key={index}>{category.title}</li> // Replace `title` with the property you want to display
              ))
            ) : (
              <li>No categories available</li> // Fallback if `categories` is not an array
            )}
          </ul>
          <ul>
            {motel.business_hours?.[0]?.open.map((hours) => (
              <li key={hours._id}>
                <strong>{daysOfWeek[hours.day]}:</strong>{" "}
                {hours.start === "0000" && hours.end === "0000"
                  ? "Open 24 Hours"
                  : `${formatTime(hours.start)} - ${formatTime(hours.end)}`}
                {hours.day === currentDay && (
                  <span style={{ marginLeft: "10px", color: openNow ? "green" : "red" }}>
                    {openNow ? "Open Now" : "Closed Now"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Information */}
        <div className="info-section contact-info">
          <h3>Contact Information</h3>
          <p>
            <a href={`https://${motel.website}`} target="_blank" rel="noopener noreferrer">
              {motel.website}
            </a>
          </p>
          <p>📞 {motel.phone}</p>
          <p>📍 {motel.location.address1} <br/>
                {motel.location.city} <br/>
                {motel.location.state} - {motel.location.zip_code}
          </p>
        </div>
        <div className="info-section">
        <h3>Amenities and More</h3>
        <div className="amenities-list">
          <ul className="attributes-list">
            {displayAttributes.map((attr, index) => (
              <li key={index} className="attribute-item">
                <span className="icon">{attr.icon}</span>
                <span className="label">
                  {attr.label}:{" "}
                  <strong>
                    {motel.attributes[attr.key] === true
                      ? "Yes"
                      : motel.attributes[attr.key] === false
                      ? "No"
                      : motel.attributes[attr.key] || "N/A"}
                  </strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>

  
      

      <div className="reviews-section">
        
      <div className="averages-section">
        <h3>Overall Ratings</h3>
        <ul className="average-list">
          {Object.entries(averages).map(([category, rating]) => (
            <li key={category} className="average-item">
              <div className="average-category">
                {capitalizeWords(category.replace(/([A-Z])/g, " $1"))}: <strong>{rating || "N/A"}</strong>
              </div>
              <div className="avgstars">
                {[...Array(5)].map((_, index) => {
                  const fullStars = Math.floor(rating); // Full stars count
                  const isHalfStar = rating - fullStars >= 0.5 && index === fullStars; // Check for half star
                  return (
                    <span
                      key={index}
                      className={
                        index < fullStars
                          ? "avgstar filled"
                          : isHalfStar
                          ? "avgstar half-filled"
                          : "avgstar"
                      }
                    >
                      ★
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>







      {/* User Reviews */}
      <div className="reviews-section">
      <h3>User Reviews</h3>
      
        <div className="reviews-container">
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i> {/* Font Awesome person icon */}
              </div>
              <div className="review-content-container">
                <div className="user-details">
                  <h4>{review.username}</h4>
                  <p>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="review-content">
                  <p>{review.reviewDesc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>



        {/* Pagination */}
        <div className="pagination">
          {[...Array(totalPages).keys()].map((_, i) => (
            <button
              key={i}
              className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
        {/* Photos Modal */}
        {showPhotosModal && (
          <div className="photos-modal">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setShowPhotosModal(false)}>×</button>
              <h3>Photos from Reviews</h3>
              <div className="photo-preview">
                {photos.length > 0 ? (
                  <>
                    <img
                      src={photos[currentIndex].replace(/ /g, "%20")} // Encode URL
                      alt={`Photo ${currentIndex}`}
                      className="photo-thumbnail"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150"; // Fallback for broken images
                      }}
                    />
                    <div className="photo-navigation">
                      <button
                        className="nav-button left-arrow"
                        disabled={currentIndex === 0} // Disable if on the first photo
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                      >
                        ←
                      </button>
                      <button
                        className="nav-button right-arrow"
                        disabled={currentIndex === photos.length - 1} // Disable if on the last photo
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                      >
                        →
                      </button>
                    </div>
                  </>
                ) : (
                  <p>No photos available.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default MotelDetail;
