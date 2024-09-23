const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('../firebase/firebase');
const { createErrorResponse, createSuccessResponse, main } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');
const db = admin.database();
const path = main().path;

const USERNAME_VALIDATION = {
  minLength: 5,
  maxLength: 20,
  regex: /^[a-zA-Z0-9_.-]+$/,
  errorMessage: {
    length: 'Username must be between 5 and 20 characters long.',
    format: 'Username must contain only letters, numbers, dots, or dashes.'
  }
};

const validateUsername = (username) => {
  const { minLength, maxLength, regex, errorMessage } = USERNAME_VALIDATION;
  if (username.length < minLength || username.length > maxLength) {
    return { status: false, message: errorMessage.length };
  }
  if (!regex.test(username)) {
    return { status: false, message: errorMessage.format };
  }
  return { status: true, message: 'done' };
};

const formatText = (input) => input.trim().toLowerCase();

// Signup controller
const signup = async (req, res) => {
  let { username, password, nickname } = req.body;
  username = formatText(username);
  nickname = formatText(nickname);

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.status) {
    return res.status(400).json(createErrorResponse(usernameValidation.message, ERROR_CODES.USERNAME_INVALID));
  }

  const userRef = db.ref(`${path}/users`).orderByChild('username').equalTo(username);
  userRef.once('value', async (snapshot) => {
    if (snapshot.exists()) {
      return res.status(400).json(createErrorResponse("Username already exists.", ERROR_CODES.USER_EXISTS));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const uid = uuidv4();

    await db.ref(`${path}/users/${uid}`).set({ uid, nickname, username, password: hashedPassword });
    res.status(201).json(createSuccessResponse({ status: true, message: 'User created successfully!', uid }));
  });
};

// Login controller
const login = async (req, res) => {
  let { username, password } = req.body;
  username = formatText(username);

  const userRef = db.ref(`${path}/users`).orderByChild('username').equalTo(username);
  userRef.once('value', async (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(400).json(createErrorResponse("Invalid login credentials.", ERROR_CODES.INVALID_CREDENTIALS));
    }

    const user = Object.values(snapshot.val())[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json(createErrorResponse("Invalid login credentials.", ERROR_CODES.INVALID_CREDENTIALS));
    }

    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
    const refreshToken = jwt.sign({ uid: user.uid }, process.env.REFRESH_TOKEN_SECRET);

    await db.ref(`${path}/refreshTokens/${uuidv4()}`).set({ token: refreshToken, uid: user.uid });
    res.json(createSuccessResponse({ status: true, message: 'Login successful!', token, refreshToken, uid: user.uid }));
  });
};

// Refresh token controller
const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json(createErrorResponse("Refresh token missing.", ERROR_CODES.MISSING_TOKEN));
  }

  const refreshTokenRef = db.ref(`${path}/refreshTokens`).orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(403).json(createErrorResponse("Refresh token missing.", ERROR_CODES.INVALID_TOKEN));
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json(createErrorResponse("Invalid refresh token.", ERROR_CODES.INVALID_TOKEN));
      }

      const newToken = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
      res.json(createSuccessResponse({ status: true, message: "Token updated", token: newToken }));
    });
  });
};

// Logout controller
const logout = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(createErrorResponse("Refresh token missing.", ERROR_CODES.MISSING_TOKEN));
  }

  const refreshTokenRef = db.ref(`${path}/refreshTokens`).orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(400).json(createErrorResponse("Invalid refresh token.", ERROR_CODES.INVALID_TOKEN));
    }

    const tokenKey = Object.keys(snapshot.val())[0];
    db.ref(`${path}/refreshTokens/${tokenKey}`).remove(() => {
      res.json(createSuccessResponse({ status: true, message: 'Logout successful, token invalidated!' }));
    });
  });
};

module.exports = { signup, login, refreshToken, logout };
