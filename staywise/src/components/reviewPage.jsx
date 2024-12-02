import React, { useState, useEffect } from 'react';
import './css/reviewPage.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewPage = () => {
  const [ratings, setRatings] = useState({
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
  });

  const [hover, setHover] = useState({});
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [motel, setMotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMotel = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/motel/${id}`);
        setMotel(response.data);
      } catch (err) {
        console.error('Error fetching motel:', err);
      }
    };

    fetchMotel();
  }, [id]);

  const handleRating = (category, rate) => {
    setRatings({ ...ratings, [category]: rate });
  };

  const handleMouseOver = (category, rate) => {
    setHover({ ...hover, [category]: rate });
  };

  const handleMouseOut = (category) => {
    setHover({ ...hover, [category]: 0 });
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);

    // Generate preview URLs for the uploaded images
    const previewURLs = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prevPreviewImages) => [...prevPreviewImages, ...previewURLs]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = localStorage.getItem('userData');
    if (!userData) {
      console.error('User data not found in localStorage');
      return;
    }

    const user = JSON.parse(userData);

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('username', user.username);
    formData.append('motelId', id);

    // Append ratings
    Object.keys(ratings).forEach((category) => {
      formData.append(category, ratings[category]);
    });

    // Append review description
    formData.append('reviewDesc', review);

    // Append photos
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Review posted successfully:', response.data);

      // Show popup and navigate to explore page
      
     
        
        navigate('/explore'); // Navigate to the explore page
      
    } catch (error) {
      console.error('Error posting review:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="center-wrapper">
      {motel ? (
        <div className="review-container">
          <div className="review-header">
            <h1>{motel.name}</h1>
            <h5>
              {motel.location.city}, {motel.location.state} - {motel.location.zip_code}
            </h5>
          </div>
          <form onSubmit={handleSubmit}>
          {[
                { label: 'Overall Experience', key: 'overall' },
                { label: 'Ambiance & Atmosphere', key: 'ambiance' },
                { label: 'Service Quality', key: 'service' },
                { label: 'Value for Money', key: 'value' },
                { label: 'Pet-Friendliness', key: 'petFriendly' },
                { label: 'Parking Availability', key: 'parking' },
                { label: 'Cleanliness & Hygiene', key: 'cleanliness' },
                { label: 'Room Comfort & Space', key: 'roomComfort' },
                { label: 'Dining Options', key: 'dining' },
                { label: 'Wi-Fi & Connectivity', key: 'wifi' },
                { label: 'Accessibility Features', key: 'accessibility' },
                { label: 'Child-Friendly Facilities', key: 'childFriendly' },
                ].map((category) => (
              <div key={category.key} className="rating-container">
                <h4>{category.label}</h4>
                {[...Array(5)].map((_, index) => {
                  const rate = index + 1;
                  return (
                    <button
                      type="button"
                      key={rate}
                      className={rate <= (hover[category.key] || ratings[category.key]) ? 'on' : 'off'}
                      onClick={() => handleRating(category.key, rate)}
                      onMouseOver={() => handleMouseOver(category.key, rate)}
                      onMouseOut={() => handleMouseOut(category.key)}
                    >
                      <span className="star">&#9733;</span>
                    </button>
                  );
                })}
              </div>
            ))}
            <textarea
              placeholder="Start your review..."
              className="review-text"
              value={review}
              onChange={handleReviewChange}
            />
            <div className="attach-photos">
              <label htmlFor="photo-upload" className="custom-file-upload">
                &#43; Attach photos
              </label>
              <input
                id="photo-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>
            <div className="preview-container">
              {previewImages.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index}`} className="preview-image" />
              ))}
            </div>
            <button className="submit-btn" type="submit">
              Post Review
            </button>
          </form>
        </div>
      ) : (
        <div>Loading motel details...</div>
      )}
      {showPopup && <div className="popup">Thank you for your valuable feedback!</div>}
    </div>
  );
};

export default ReviewPage;
