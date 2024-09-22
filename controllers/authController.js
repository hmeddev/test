const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase');
const { createErrorResponse, createSuccessResponse,main } = require('../Handler');
const db = admin.database();
const path = main().path


function validateUsername(username) {
  const minLength = 5;
  const maxLength = 20;
  const regex = /^[a-zA-Z0-9_.-]+$/;

  if (username.length < minLength || username.length > maxLength) {
    return { status: false, message: 'Username must be between 5 and 20 characters long.' };;
  }

  if (!regex.test(username)) {
    return { status: false, message: 'Username must contain only letters and numbers, and can contain dots or dashes.' };
  }

  return  { status: true, message: 'done' };
}
function formatText(input) {
    return input.trim().toLowerCase();
}
// Signup controller
const signup = async (req, res) => {
  const { username, password,nickname } = req.body;
  nickname = formatText(nickname)
  username = formatText(username)
  if(!validateUsername(username).status)
    {
      const error = createErrorResponse(validateUsername(username).message,13)
      return res.status(400).json(error);
    }
  // Check if user already exists
  const userRef = db.ref(path+'/users').orderByChild('username').equalTo(username);
  userRef.once('value', async snapshot => {
    if (snapshot.exists()) {
      const error = createErrorResponse("Username already exists.",6)
      return res.status(400).json(error);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const uid = uuidv4();

    // Save user to Firebase
    db.ref(path+'/users/' + uid).set({
      uid,
      nickname,
      username,
      password: hashedPassword,
    });
    const data = { status: true, message: 'User created successfully!', uid }
    const res = createSuccessResponse(data)
    res.status(201).json(res);
    
  });
};

// Login controller
const login = async (req, res) => {
  const { username, password } = req.body;
  username = formatText(username)
  const userRef = db.ref(path+'/users').orderByChild('username').equalTo(username);
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
    db.ref(path+'/refreshTokens/' + uuidv4()).set(refreshTokenEntry);
  
    
    const data = { status: true, message: 'Login successful!', token, refreshToken, uid:user.uid }
    const res = createSuccessResponse(data)
    
    res.json(res);
  });
};

// Refresh token controller
const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    const error = createErrorResponse("Refresh token missing.",8)
    return res.status(403).json(error);
  }

  // Check if refresh token exists in the database
  const refreshTokenRef = db.ref(path+'/refreshTokens').orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      const error = createErrorResponse("Refresh token missing.",9)
      return res.status(403).json(error);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        const error = createErrorResponse("Invalid refresh token.",10)
        return res.status(403).json(error);
      }

      // Generate a new access token
      const newToken = jwt.sign({ uid: user.uid, role: user.role }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
      const data = { status: true,message:"Token updated", token: newToken }
      const res = createSuccessResponse(data)
      res.json(res);
    });
  });
};

// Logout controller
const logout = (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    const error = createErrorResponse("Refresh token missing.",8)
    return res.status(400).json(error);
  }

  // إبطال التوكن المتجدد في قاعدة البيانات
  const refreshTokenRef = db.ref(path+'/refreshTokens').orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      const error = createErrorResponse("Invalid refresh token.",9)
      return res.status(400).json(error);
    }

    // إبطال التوكن (إزالته من قاعدة البيانات)
    const tokenKey = Object.keys(snapshot.val())[0];
    db.ref(path+'/refreshTokens/' + tokenKey).remove(() => {
      const data = { status: true, message: 'Logout successful, token invalidated!' }
    const res = createSuccessResponse(data)
      return res.json(res);
    });
  });
};

module.exports = { signup, login, refreshToken, logout };
