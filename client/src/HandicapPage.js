// Import required libraries and components
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Functional component representing the Handicap page
const HandicapPage = ({
  onHandicapIndexChange,
  handicapIndex,
  currentScore,
  courseRating,
  slopeRating,
  handleScoreChange,
  handleCourseRatingChange,
  handleSlopeRatingChange,
  user,
}) => {
  // State variables to manage server scores and course name input
  const [serverScores, setServerScores] = useState([]);
  const [courseName, setCourseName] = useState('');

  // Event handler for course name input change
  const handleCourseNameChange = (e) => {
    setCourseName(e.target.value);
  };

  // Effect hook to fetch scores from the server on component mount
  useEffect(() => {
    // Only fetch scores if the user is logged in
    if (localStorage.getItem('jwtToken')) {
    axios
      .get('http://172.179.8.99:5001/api/scores', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
      .then((response) => {
        setServerScores(response.data);
      })
      .catch((error) => {
        console.error('Error fetching scores:', error);
      });
    }
  }, []);

  // Effect hook to calculate handicap when serverScores or onHandicapIndexChange updates
  useEffect(() => {
    if (serverScores.length >= 2 && localStorage.getItem('jwtToken')) {
      const differentials = serverScores.map((score) => {
        const adjustedGrossScore = score.score - score.courseRating;
        const differential = adjustedGrossScore * (113 / score.slopeRating);
        return differential.toFixed(2);
      });

      let handicapIndex;
      if (serverScores.length <= 8) {
        // Calculate handicap index for users with 8 or fewer scores
        handicapIndex =
          differentials.reduce((sum, differential) => sum + parseFloat(differential), 0) /
          differentials.length *
          0.96;
      } else {
        // Calculate handicap index for users with more than 8 scores (use best 8 differentials(rounds))
        const bestDifferentials = differentials.sort((a, b) => a - b).slice(0, 8);
        handicapIndex =
          bestDifferentials.reduce((sum, differential) => sum + parseFloat(differential), 0) /
          bestDifferentials.length *
          0.96;
      }
      // Pass the calculated handicap index to the parent component (one decimal place)
      onHandicapIndexChange(handicapIndex.toFixed(1));
    }
  }, [serverScores, onHandicapIndexChange]);

  // Function to save a new score to the server
  const saveScore = () => {
    const scoreData = {
      score: currentScore,
      courseRating,
      slopeRating,
      courseName,
    };
    // console.log(localStorage.getItem('jwtToken'));
    axios
      .post('http://172.179.8.99:5001/api/scores', scoreData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then(() => {
        console.log('Score saved successfully');
        setServerScores([scoreData, ...serverScores]); // Add the new score at the beginning
      })
      .catch((error) => {
        console.error('Error saving score:', error);
      });
  };

  // JSX
  return (
    <div>
      <h2>Handicap Page</h2>
      <br />
      {user ? (
        // If the user is logged in, show the score entry section
        <div>
          <div className="desktop-only">
            {/* Table for Desktop View */}
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Score</th>
                  <th>Course Rating</th>
                  <th>Slope Rating</th>
                  <th>Add Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      value={courseName}
                      onChange={handleCourseNameChange}
                      placeholder="Enter the course name"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={currentScore}
                      onChange={handleScoreChange}
                      placeholder="Enter a score"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={courseRating}
                      onChange={handleCourseRatingChange}
                      placeholder="Enter the course rating"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={slopeRating}
                      onChange={handleSlopeRatingChange}
                      placeholder="Enter the slope rating"
                    />
                  </td>
                  <td>
                    <button onClick={saveScore}>Add Score</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <table className="mobile-only">
            <tbody>
              <tr>
                <td>Course Name:</td>
                <td>
                  <input
                    type="text"
                    value={courseName}
                    onChange={handleCourseNameChange}
                    placeholder="Enter course name"
                  />
                </td>
              </tr>
              <tr>
                <td>Score:</td>
                <td>
                  <input
                    type="number"
                    value={currentScore}
                    onChange={handleScoreChange}
                    placeholder="Enter score"
                  />
                </td>
              </tr>
              <tr>
                <td>Course Rating:</td>
                <td>
                  <input
                    type="number"
                    value={courseRating}
                    onChange={handleCourseRatingChange}
                    placeholder="Enter course rating"
                  />
                </td>
              </tr>
              <tr>
                <td>Slope Rating:</td>
                <td>
                  <input
                    type="number"
                    value={slopeRating}
                    onChange={handleSlopeRatingChange}
                    placeholder="Enter slope rating"
                  />
                </td>
                
              </tr>
              <button onClick={saveScore}>Add Score</button>
            </tbody>
          </table>
      
        

      {localStorage.getItem('jwtToken') && (
      <div>
        <br />
        <h3>Rounds:</h3>
        <br />
        <table>
        <thead>
  <tr>
    <th className="desktop-only">Course Name</th>
    <th className="desktop-only">Score</th>
    <th className="desktop-only">Course Rating</th>
    <th className="desktop-only">Slope Rating</th>
    <th className="desktop-only">Handicap</th>
    <th className="mobile-only">Course</th>
    <th className="mobile-only">Score</th>
    <th className="mobile-only">Course Rating</th>
    <th className="mobile-only">Slope Rating</th>
    <th className="mobile-only">H Index</th>
  </tr>
</thead>
          <tbody>
            {serverScores.map((score, index) => (
              <tr key={index}>
                <td>{score.courseName}</td>
                <td>{score.score}</td>
                <td>{score.courseRating}</td>
                <td>{score.slopeRating}</td>
                <td>{handicapIndex && index === 0 ? handicapIndex : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
      </div>
      )}
      
      {handicapIndex && (
        <div>
          <h3>Handicap:</h3>
          <p>{handicapIndex}</p>
        </div>
      )}
    </div>
    ) : (
      // If the user is not logged in, show a message prompting them to log in
      <p>Please login or register to calculate your handicap.</p>
    )}
  </div>
  );
};

export default HandicapPage;