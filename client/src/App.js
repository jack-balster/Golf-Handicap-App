// Import required libraries and components
import React, { useState } from 'react';
import { HashRouter as Router, Switch, Route, NavLink, Link } from 'react-router-dom';
import './styles.css';
import HandicapPage from './HandicapPage';
import LeaderboardPage from './LeaderboardPage';
import LoginPage from './LoginPage';
import RoundHistoryPage from './RoundHistoryPage';
<link rel="stylesheet" href="styles.css" />
// Functional component representing the main App
const App = () => {
  // State variables to manage user data, scores, and input values
  const [handicapIndex, setHandicapIndex] = useState(null);
  const [scores, setScores] = useState([]);
  const [currentScore, setCurrentScore] = useState('');
  const [courseRating, setCourseRating] = useState('');
  const [slopeRating, setSlopeRating] = useState('');
  const [user, setUser] = useState(null);

  // Event handler for user login
  const handleUserLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('jwtToken', userData.token);
  };

  // Event handler for user logout
  const handleUserLogout = () => {
    setUser(null);
    localStorage.removeItem('jwtToken');
    setHandicapIndex(null);
    setScores([]);
  };

  // Event handler for updating handicap index
  const handleHandicapIndexChange = (index) => {
    setHandicapIndex(index);
  };

  // Event handler for score input change
  const handleScoreChange = (e) => {
    setCurrentScore(e.target.value);
  };

  // Event handler for course rating input change
  const handleCourseRatingChange = (e) => {
    setCourseRating(e.target.value);
  };

  // Event handler for slope rating input change
  const handleSlopeRatingChange = (e) => {
    setSlopeRating(e.target.value);
  };

  // Function to add a new score to the scores state
  const addScore = () => {
    setScores([...scores, { score: currentScore, courseRating, slopeRating }]);
    setCurrentScore('');
    setCourseRating('');
    setSlopeRating('');
  };

  // JSX representing the Router and main App layout
  return (
    <Router>
      <div className="container">
        {/* Golf Emoji Logo */}
        <div className="golf-logo">⛳ </div>
        {/* Navigation Sidebar */}
        <nav className="sidebar">
          <ul>
            <li>
              <NavLink exact to="/" activeClassName="active-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink exact to="/Handicap" activeClassName="active-link">
                Handicap
              </NavLink>
            </li>
            <li>
            <NavLink exact to="/Leaderboard" activeClassName="active-link">
                Leaderboard
              </NavLink>
            </li>
            <li>
              <NavLink exact to="/round-history" activeClassName="active-link">
                Round History
              </NavLink>
            </li>
            <li>
              {user ? (
                
                <Link to="/" onClick={handleUserLogout}>Logout</Link>
              ) : (
                <NavLink exact to="/Login/Register" activeClassName="active-link">
                Login/Register
              </NavLink>
              )}
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="switch-container">
          <Switch>
            <Route path="/handicap">
              <HandicapPage
              onHandicapIndexChange={handleHandicapIndexChange}
              handicapIndex={handicapIndex}
              scores={scores}
              currentScore={currentScore}
              courseRating={courseRating}
              slopeRating={slopeRating}
              handleScoreChange={handleScoreChange}
              handleCourseRatingChange={handleCourseRatingChange}
              handleSlopeRatingChange={handleSlopeRatingChange}
              addScore={addScore}
              user={user}
              />
            </Route>
            <Route path="/leaderboard">
              <LeaderboardPage />
            </Route>
            <Route path="/round-history">
              <RoundHistoryPage />
            </Route>
            <Route path="/login">
              <LoginPage onUserLogin={handleUserLogin} />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

const Home = () => {
  return (
    <div>
      <div className="main-content">
      <h1>Welcome to My Golf App</h1>
      <br /><br />
      <p>A golf web app designed to enhance your golfing experience and help keep track of your rounds and handicap. Whether you're a seasoned golfer or just starting your golfing journey, this app will help keep you organized and up to date with your friends!</p>
      <br /><br />
      <p>Key Features:</p>
      <br />
      <ul>
        <li><strong>Handicap Calculation:</strong> Keep track of your golf scores and course ratings to automatically calculate and update your handicap. The handicap index is a crucial indicator of your playing ability and can help level the playing field when competing against other golfers.</li>
        <br />
        <li><strong>Leaderboard:</strong> See how you rank compared to other users on the app. The leaderboard displays the top golfers with the lowest handicaps, making it a fun way to challenge yourself and compete against others. </li>
        <br />
        <li><strong>Round History:</strong> Access a comprehensive history of all your golf rounds as well as the rounds of others. View details such as the course names, scores, course ratings, and slope ratings for each round.</li>
        <br />
        <li><strong>User Registration and Login:</strong> Create a personal account to securely store your golfing data. Log in to access your handicap, round history, and other personalized features.</li>
      </ul>
      <br /><br />
      <p>Whether you're striving to lower your handicap, compete with friends, or simply enjoy the sport, this golf web app is here to support you every step of the way. More updates coming soon!</p>
    </div>
    </div>
  );
};

export default App;
