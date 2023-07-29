// Import required libraries and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Functional component representing the Leaderboard page
const LeaderboardPage = () => {
  // State variable to store leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Effect hook to fetch leaderboard data from the server on component mount
  useEffect(() => {
    axios
      .get('http://172.179.8.99:5001/api/leaderboard')
      .then((response) => {
        setLeaderboardData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
      });
  }, []);

  //JSX
  return (
    <div>
      <h2>Leaderboard</h2>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th style={{ paddingLeft: '20px' }}>Handicap</th>
          </tr>
        </thead>
        <tbody>
        <tr></tr><tr></tr><tr></tr><tr></tr>
          {leaderboardData.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td style={{ paddingLeft: '20px' }}>{user.handicapIndex.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardPage;
