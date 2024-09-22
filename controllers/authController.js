const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../Handler');
const db = admin.database();

// Signup controller
const signup = async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userRef = db.ref('users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (snapshot.exists()) {
      const error = createErrorResponse("Username already exists.",6)
      return res.status(400).json(error);
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
    const data = { status: true, message: 'User created successfully!', uid }
    const res = createSuccessResponse(data)
    res.status(201).json(res);
    
  });
};

// Login controller
const login = async (req, res) => {
  const { username, password } = req.body;

  const userRef = db.ref('users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (!snapshot.exists()) {
      const error = createErrorResponse("Invalid login credentials.",7)
      return res.status(400).json(error);
       
    }

    const userData = snapshot.val();
    const user = Object.values(userData)[0]; 
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error = createErrorResponse("Invalid login credentials.",7)
      return res.status(400).json(error);
    }

    // Generate JWT tokens
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
    const refreshToken = jwt.sign({ uid: user.uid }, process.env.REFRESH_TOKEN_SECRET);

    // Store the refresh token in the database
    const refreshTokenEntry = { token: refreshToken, uid: user.uid };
    db.ref('refreshTokens/' + uuidv4()).set(refreshTokenEntry);
  
    
    const data = { status: true, message: 'Login successful!', token, refreshToken, uid:user.uid }
    const res = createSuccessResponse(data)
    
    res.json(res);
  });
};

// Refresh token controller
const refreshToken = (req, res) => {
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
