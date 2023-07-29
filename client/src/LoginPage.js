// Import required libraries and components
import React, { useState } from 'react';
import axios from 'axios';

// Functional component representing the login/registration page
const LoginPage = ({ onUserLogin }) => {
  // State variables to manage form input values, messages, and registration status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Event handler for username input change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  // Event handler for password input change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Event handler for form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Check if the user is registering or logging in
    if (isRegistering) {
      // Register a new user
      const userData = {
        username,
        password,
      };

      axios
        .post('http://172.179.8.99:5001/api/register', userData)
        .then((response) => {
          localStorage.setItem('jwtToken', response.data.token);
          // console.log('Token:', response.data.token);
          onUserLogin(response.data);
          setSuccessMessage('Registered successfully!');
        })
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.error) {
            setErrorMessage(error.response.data.error); // Dynamic error message
          } else {
            console.error('Error registering user:', error);
            setErrorMessage('Failed to register user. Please try again later.'); // Default error message
          }
        });
    } else {
      // Log in existing user
      const userData = {
        username,
        password,
      };

      axios
        .post('http://172.179.8.99:5001/api/login', userData)
        .then((response) => {
          localStorage.setItem('jwtToken', response.data.token);
          // console.log('Token:', response.data.token);
          onUserLogin(response.data);
          setSuccessMessage('Login successful!');
        })
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.error) {
            setErrorMessage(error.response.data.error); // Set error message from the response
          } else {
            console.error('Error logging in:', error);
            setErrorMessage('Failed to log in. Please try again later.'); // Default error message
          }
        });
    }
  };

// JSX representing the login/registration form and UI elements
  return (
    <div className="login-page">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleFormSubmit}>
        <br />
        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} placeholder="First name, last initial" required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} required />
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <br /><br /><br />
      <p>
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
      </p>
      <br />
      <div>
        <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;