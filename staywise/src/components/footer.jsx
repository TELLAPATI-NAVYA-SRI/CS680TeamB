import React from 'react';
import './css/foot.css';

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-container">
        {/* About Us Section */}
        <div className="footer-section about-us">
          <h4>What do we do..</h4>
          <p>
            At Your Company, we are passionate about innovation and excellence. 
            We strive to provide cutting-edge solutions tailored to meet our clients' needs, 
            ensuring unparalleled service and satisfaction. Join us on our journey to redefine industry standards and create impactful experiences.
          </p>
        </div>

        {/* Find Us Section */}
        <div className="footer-section find-us">
          <h4>Find Us</h4>
          <p>📍 123 Business Ave, Suite 456</p>
          <p>City Name, State, 78901</p>
          <p>📞 +1 234-567-8900</p>
          <p>✉️ <a href="mailto:contact@StayWise.com">contact@StayWise.com</a></p>
        </div>

        {/* Follow Us Section */}
        <div className="footer-section follow-us">
          <h4>Follow Us</h4>
          <p>Stay connected for updates and offers:</p>
          <div className="social-links">
            <p>🐦 Twitter: <a href="https://twitter.com/StayWise">Follow us</a></p>
            <p>📘 Facebook: <a href="https://www.facebook.com/StayWise">Like our Page</a></p>
            <p>📸 Instagram: <a href="https://www.instagram.com/StayWise">Follow our Journey</a></p>
            <p>💼 LinkedIn: <a href="https://www.linkedin.com/company/StayWise">Connect with us</a></p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright © 2024 | Designed With ❤️ by <a href="#">StayWise</a></p>
        <div className="social-icons">
          <a href="https://www.facebook.com/StayWise"><i className="fab fa-facebook"></i></a>
          <a href="https://twitter.com/StayWise"><i className="fab fa-twitter"></i></a>
          <a href="https://www.linkedin.com/company/StayWise"><i className="fab fa-linkedin"></i></a>
          <a href="https://www.instagram.com/StayWise"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
