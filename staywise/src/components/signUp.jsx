import React, { useState } from 'react';
import axios from 'axios';
import './css/signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    passwordMismatch: false,
    serverError: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Reset errors when user modifies any input
    if (errors.passwordMismatch) {
      setErrors({ ...errors, passwordMismatch: false });
    }
    if (errors.serverError) {
      setErrors({ ...errors, serverError: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, passwordMismatch: true });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log('Signup successful:', response.data);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      alert('user added successfully!! ')
      // Optionally redirect the user or clear the form
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      setErrors({ ...errors, serverError: message });
      console.error('Error:', message);
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first-name">First Name:</label>
          <input
            type="text"
            id="first-name"
            name="firstName"
            onChange={handleChange}
            value={formData.firstName}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last Name:</label>
          <input
            type="text"
            id="last-name"
            name="lastName"
            onChange={handleChange}
            value={formData.lastName}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={handleChange}
            value={formData.username}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            name="confirmPassword"
            onChange={handleChange}
            value={formData.confirmPassword}
            required
          />
          {errors.passwordMismatch && <div className="error">Passwords do not match.</div>}
        </div>
        <button type="submit" className="signup-btn">Sign Up</button>
        {errors.serverError && <div className="error">{errors.serverError}</div>}
      </form>
    </div>
  );
};

export default Signup;
