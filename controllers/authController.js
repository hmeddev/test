const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase');
const db = admin.database();

// Signup controller
const signup = async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userRef = db.ref('users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (snapshot.exists()) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const uid = uuidv4();

    // Save user to Firebase
    db.ref('users/' + uid).set({
      uid,
      username,
      password: hashedPassword,
      role: 'USER'
    });

    res.status(201).json({ message: 'User created successfully!', uid });
  });
};

// Login controller
const login = async (req, res) => {
  const { username, password } = req.body;

  const userRef = db.ref('users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (!snapshot.exists()) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    const userData = snapshot.val();
    const user = Object.values(userData)[0]; // Get the first user match

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid login credentials.' });
    }

    // Generate JWT tokens
    const token = jwt.sign({ uid: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ uid: user.uid, role: user.role }, process.env.REFRESH_TOKEN_SECRET);

    res.json({ message: 'Login successful!', token, refreshToken });
  });
};

// Refresh token controller
const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json({ error: 'Refresh token missing.' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid refresh token.' });
    }

    const newToken = jwt.sign({ uid: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ token: newToken });
  });
};

// Logout controller
const logout = (req, res) => {
  // Invalidate refresh tokens logic here
  res.json({ message: 'Logout successful!' });
};

module.exports = { signup, login, refreshToken, logout };
