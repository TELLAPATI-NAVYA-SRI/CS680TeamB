import React, { useEffect, useState } from "react";
import './css/land.css';
import { Link, useNavigate } from 'react-router-dom';
import { Collapse, Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

// Import your images
import image1 from '../img/sara-dubler-Koei_7yYtIo-unsplash.jpg';
import image2 from '../img/valeriia-bugaiova-_pPHgeHz1uk-unsplash.jpg';




const Landing = () => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const slides = [
    {
      text: "Discover New Places with Our Top-Rated Guide! Enjoy crafted tours, exceptional customer service, and memories that last a lifetime.",
      bgColor: "rgba(60, 0, 128, 0.8)", // Purple with 80% opacity
      position: "bottom-right",
      color: "white",
      backgroundImage: `url(${image1})`
    },
    {
      text: "Explore the Best of Our Services! Offering unique experiences tailored to your needs, discover and embrace the quality you deserve with us.",
      bgColor: "rgba(255, 152, 0, 0.8)", // Orange with 80% opacity
      position: "top-left",
      color: "black",
      backgroundImage: `url(${image2})`
    },
  ];
  

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length); // Cycles forward through slides
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); // Cycles backward through slides
    };


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', formData);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      navigate('/explore');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      setError(message);
    }
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const { email, newPassword, confirmPassword } = forgotPasswordData;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/forgot-password', { email, newPassword });
      alert("Password updated successfully!");
      setModalOpen(false);
    } catch (err) {
      alert("Error updating password. Please try again.");
    }
  };
  return (
    <div className="landing">
      <div className="carousel-container">
            <div className={`carousel ${slides[currentSlide].position}`} style={{backgroundImage:slides[currentSlide].backgroundImage}}>
                
                <div className={`carousel-info ${slides[currentSlide].position}`} style={{backgroundColor: slides[currentSlide].bgColor,color: slides[currentSlide].color}}>
                    <p>{slides[currentSlide].text}</p>
                </div>
                <button onClick={prevSlide} className="arrow left">&#10094;</button>
                <button onClick={nextSlide} className="arrow right">&#10095;</button>
            </div>
      </div>
      <div className="about-section" id="about">
        <div className="about-head">About</div>
        <div className="about-content">
          <h1>Welcome to StayWise</h1>
          <p> we bridge the gap between technology
             and convenience to enhance your daily experiences. Our platform is dedicated to 
             delivering exceptional service and innovative solutions tailored to meet the diverse
              needs of our community. From seamless booking systems to comprehensive user reviews,
               we empower you to make informed decisions with ease and confidence. 
               Explore our site to discover a world of possibilities that awaits you, 
               all designed with your satisfaction in mind. Join us on a journey of discovery and 
               let us help you unlock new opportunities every day!</p>
        </div>
      </div>
      <div className="login-section" id = "login">
        <div className="form-container1">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="form-group">
              <label htmlFor="identifier">Username or Email:</label>
              <input type="text" id="identifier" name="identifier" onChange={handleChange} value={formData.identifier} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" onChange={handleChange} value={formData.password} required />
            </div>
            <div className="form-links">
              <Link to="/signup">Register</Link>
              <a
                type="button"
                onClick={() => {
                  console.log("Opening modal...");
                  setModalOpen(true);
                  
                }}
                role="button"
                className="forgot-password-link"
              >
                Forgot Password?
              </a>

            </div>
            <button className="landbutton" type="submit">Log In</button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
        <div className="login-head">Login</div>
      </div>
      <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Forgot Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              value={forgotPasswordData.email}
              onChange={handleForgotPasswordChange}
              className="form-control"
              required
            />
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              id="newPassword"
              name="newPassword"
              value={forgotPasswordData.newPassword}
              onChange={handleForgotPasswordChange}
              className="form-control"
              required
            />
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={forgotPasswordData.confirmPassword}
              onChange={handleForgotPasswordChange}
              className="form-control"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleForgotPasswordSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>


      
    </div>
  );
};

export default Landing;
