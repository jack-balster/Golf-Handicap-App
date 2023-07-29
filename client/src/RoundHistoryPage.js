// Import required libraries and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Functional component representing the Round History page
const RoundHistoryPage = () => {
  // State variables to store user's rounds and the currently selected user
  const [usersRounds, setUsersRounds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Effect hook to fetch user's round history from the server on component mount
  useEffect(() => {
    axios
      .get('http://172.179.8.99:5001/api/round-history')
      .then((response) => {
        setUsersRounds(response.data.reverse()); // Reverse the array to display newest rounds first
      })
      .catch((error) => {
        console.error('Error fetching round history:', error);
      });
  }, []);

  // Create a Set to store unique usernames
  const uniqueUsernames = new Set();
  // Filter and populate the unique usernames
  usersRounds.forEach((userRound) => {
    uniqueUsernames.add(userRound.user?.username);
  });

  // Convert the Set back to an array for easier iteration
  const uniqueUsernamesArray = Array.from(uniqueUsernames);

  // Event handler to handle the click event on a username to select the user
  const handleUserClick = (username) => {
    // Find the user object based on the username
    const selectedUserObject = usersRounds.find((userRound) => userRound.user?.username === username);
    setSelectedUser(selectedUserObject.user);
  };

  // JSX
  return (
    <div>
      <h2>Round History</h2>
      <br />
      <div>
        <h3>Click on a user to view their Round History:</h3>
        <br />
        <ul className="usernames-list"> {/* Add the class to the list */}
          {uniqueUsernamesArray.map((username) => (
            <li className="username-item" key={username} onClick={() => handleUserClick(username)}>
              {username}
            </li>
          ))}
        </ul>
      </div>
      <br />
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Course Name</th>
            <th>Score</th>
            <th>Course Rating</th>
            <th>Slope Rating</th>
          </tr>
        </thead>
        <tbody>
          {usersRounds
            .filter((userRound) => userRound.user?.username === selectedUser?.username)
            .map((userRound, index) => (
              <tr key={index}>
                <td>{userRound.user?.username || 'N/A'}</td>
                <td>{userRound.courseName}</td>
                <td>{userRound.score}</td>
                <td>{userRound.courseRating}</td>
                <td>{userRound.slopeRating}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoundHistoryPage;
