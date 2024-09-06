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
      return res.status(400).json({ status: false, error: 'Username already exists.' });
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

    res.status(201).json({ status: true, message: 'User created successfully!', uid });
  });
};

// Login controller
const login = async (req, res) => {
  const { username, password } = req.body;

  const userRef = db.ref('users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (!snapshot.exists()) {
      return res.status(400).json({ status: false, error: 'Invalid login credentials.' });
    }

    const userData = snapshot.val();
    const user = Object.values(userData)[0]; // Get the first user match

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ status: false, error: 'Invalid login credentials.' });
    }

    // Generate JWT tokens
    const token = jwt.sign({ uid: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ uid: user.uid, role: user.role }, process.env.REFRESH_TOKEN_SECRET);

    // Store the refresh token in the database
    const refreshTokenEntry = { token: refreshToken, uid: user.uid };
    db.ref('refreshTokens/' + uuidv4()).set(refreshTokenEntry);

    res.json({ status: true, message: 'Login successful!', token, refreshToken });
  });
};

// Refresh token controller
const refreshToken = (req, res) => {
  console.log("hmed-1")
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json({ status: false, error: 'Refresh token missing.' });
  }

  // Check if refresh token exists in the database
  const refreshTokenRef = db.ref('refreshTokens').orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(403).json({ status: false, error: 'Invalid refresh token.' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ status: false, error: 'Invalid refresh token.' });
      }

      // Generate a new access token
      const newToken = jwt.sign({ uid: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
      res.json({ status: true, token: newToken });
    });
  });
};

// Logout controller
const logout = (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ status: false, error: 'Refresh token missing.' });
  }

  // إبطال التوكن المتجدد في قاعدة البيانات
  const refreshTokenRef = db.ref('refreshTokens').orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      return res.status(400).json({ status: false, error: 'Invalid refresh token.' });
    }

    // إبطال التوكن (إزالته من قاعدة البيانات)
    const tokenKey = Object.keys(snapshot.val())[0];
    db.ref('refreshTokens/' + tokenKey).remove(() => {
      return res.json({ status: true, message: 'Logout successful, token invalidated!' });
    });
  });
};

module.exports = { signup, login, refreshToken, logout };
