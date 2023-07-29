// Import required libraries and modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';

// Create an instance of Express app
const app = express();
app.use(express.json());
app.use(cors());
const JWT_SECRET = 'my seceret key var';

// Define MongoDB connection URI
const MONGODB_URI = 'my connection string var'; 

// Connect to MongoDB using Mongoose
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up MongoDB connection event handlers
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the score schema for MongoDB
const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  courseRating: {
    type: Number,
    required: true,
  },
  slopeRating: {
    type: Number,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
});

// Create the Score model using the score schema
const Score = mongoose.model('Score', scoreSchema);

// Middleware function to authenticate requests with a JWT token
const authenticateMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the "Bearer {token}" format

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

// Endpoint to get scores from the database for the authenticated user
app.get('/api/scores', authenticateMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract the user's ObjectId from the authenticated request
    const scores = await Score.find({ user: userId }).sort({ _id: -1 });
    res.status(200).json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Endpoint to save a new score to the database for the authenticated user
app.post('/api/scores', authenticateMiddleware, async (req, res) => {
  try {
    const { score, courseRating, slopeRating, courseName } = req.body;
    const userId = req.user.userId; // Extract the user's ObjectId from the authenticated request

    const newScore = new Score({ user: userId, score, courseRating, slopeRating, courseName });
    await newScore.save();

    // Delete the oldest score if there are already 20 scores
    const scoresCount = await Score.countDocuments({ user: userId });
    if (scoresCount > 20) {
      const oldestScore = await Score.findOneAndDelete({ user: userId }).sort({ _id: 1 });
      console.log('Oldest score deleted:', oldestScore);
    }

        // Recalculate the user's handicap index
        const serverScores = await Score.find({ user: userId }).sort({ _id: -1 });
        if (serverScores.length >= 2) {
          const differentials = serverScores.map((score) => {
            const adjustedGrossScore = score.score - score.courseRating;
            const differential = adjustedGrossScore * (113 / score.slopeRating);
            return differential.toFixed(2);
          });
    
          let handicapIndex;
          if (serverScores.length <= 8) {
            handicapIndex =
              differentials.reduce((sum, differential) => sum + parseFloat(differential), 0) /
              differentials.length *
              0.96;
          } else {
            const bestDifferentials = differentials.sort((a, b) => a - b).slice(0, 8);
            handicapIndex =
              bestDifferentials.reduce((sum, differential) => sum + parseFloat(differential), 0) /
              bestDifferentials.length *
              0.96;
          }
    
          // Update the user's handicap index in the database
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
    
          user.handicapIndex = handicapIndex.toFixed(1);
          await user.save();
        }

    res.status(200).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// Define the user schema for MongoDB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  handicapIndex: {
    type: Number,
    default: null,
  },
});

// Generate a JWT token for the user
userSchema.methods.generateToken = function () {
  const payload = { userId: this._id, username: this.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Create the User model using the user schema
const User = mongoose.model('User', userSchema);

// Endpoint to register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash });
    await newUser.save();

    const token = newUser.generateToken();

    res.status(200).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Endpoint to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = user.generateToken();

    res.status(200).json({ message: 'User logged in successfully', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Endpoint to get the leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ handicapIndex: { $ne: null } }).select('username handicapIndex').sort({ handicapIndex: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Endpoint to get the round history data
app.get('/api/round-history', async (req, res) => {
  try {
    const roundHistory = await Score.find()
      .populate('user', 'username') // Populate the user field with the 'username' property only
      .select('user courseName score courseRating slopeRating'); // Select specific fields from the score document

    res.status(200).json(roundHistory);
  } catch (error) {
    console.error('Error fetching round history:', error);
    res.status(500).json({ error: 'Failed to fetch round history' });
  }
});

// Catch-all route to serve the React app's entry point for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// Define the port for the server to listen on
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
