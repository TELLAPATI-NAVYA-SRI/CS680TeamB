import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import './css/nav.css';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate()
  const userData = localStorage.getItem('userData');
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userData');

    // Redirect to the homepage or login page
    navigate('/')
  };

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Navbar.Brand href="/explore" className="brand-name">
        StayWise
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {user ? (
          <Nav className="ms-auto">
            <Nav.Link href="/explore">Explore</Nav.Link>
            <Nav.Link onClick={handleLogout}>
              <i className="bi bi-logout"></i> Logout
            </Nav.Link>
            <Nav.Link href="">
              <i className="bi bi-person"></i> <span>{user.username}</span>
            </Nav.Link>
          </Nav>
        ) : (
          <Nav className="ms-auto">
            <Nav.Link href="#about">
              <i className="bi bi-info-circle"></i> About
            </Nav.Link>
            
            <Nav.Link href="#footer">
              <i className="bi bi-envelope"></i> Contact
            </Nav.Link>
            <Nav.Link href="#login">
              <i className="bi bi-login"></i> Login
            </Nav.Link>
            <Nav.Link href="/SignUp">
              <i className="bi bi-person-plus"></i> SignUp
            </Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
