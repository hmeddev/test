// authController.js

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
    return res.status(400).json(createErrorResponse(ERROR_CODES.USERNAME_INVALID, usernameValidation.message));
  }

  const userRef = db.ref(`${path}/users`).orderByChild('username').equalTo(username);
  userRef.once('value', async (snapshot) => {
    if (snapshot.exists()) {
      return res.status(400).json(createErrorResponse(ERROR_CODES.USERNAME_ALREADY_EXISTS, ERROR_CODES.USERNAME_ALREADY_EXISTS.message));
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const uid = uuidv4();

      await db.ref(`${path}/users/${uid}`).set({ uid, nickname, username, password: hashedPassword });
      res.status(201).json(createSuccessResponse({ uid }, 'User created successfully!'));
    } catch (error) {
      res.status(500).json(createErrorResponse(ERROR_CODES.ACCOUNT_CREATION_FAILED, ERROR_CODES.ACCOUNT_CREATION_FAILED.message));
    }
  });
};

// Login controller
const login = async (req, res) => {
  let { username, password } = req.body;
  username = formatText(username);

  const userRef = db.ref(`${path}/users`).orderByChild('username').equalTo(username);
  userRef.once('value', async (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(400).json(createErrorResponse(ERROR_CODES.INVALID_LOGIN_CREDENTIALS, ERROR_CODES.INVALID_LOGIN_CREDENTIALS.message));
    }

    const user = Object.values(snapshot.val())[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json(createErrorResponse(ERROR_CODES.INVALID_LOGIN_CREDENTIALS, ERROR_CODES.INVALID_LOGIN_CREDENTIALS.message));
    }

    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
    const refreshToken = jwt.sign({ uid: user.uid }, process.env.REFRESH_TOKEN_SECRET);

    try {
      await db.ref(`${path}/refreshTokens/${uuidv4()}`).set({ token: refreshToken, uid: user.uid });
      res.json(createSuccessResponse({ token, refreshToken, uid: user.uid }, 'Login successful!'));
    } catch (error) {
      res.status(500).json(createErrorResponse(ERROR_CODES.TOKEN_RENEWAL_FAILED, ERROR_CODES.TOKEN_RENEWAL_FAILED.message));
    }
  });
};

// Refresh token controller
const refreshTokenController = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json(createErrorResponse(ERROR_CODES.REFRESH_TOKEN_MISSING, ERROR_CODES.REFRESH_TOKEN_MISSING.message));
  }

  const refreshTokenRef = db.ref(`${path}/refreshTokens`).orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(403).json(createErrorResponse(ERROR_CODES.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN.message));
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json(createErrorResponse(ERROR_CODES.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN.message));
      }

      // الحصول على الوقت الحالي
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(user)
      // التحقق من وقت انتهاء صلاحية التوكن
      if (user.iat && user.iat > currentTime) {
        return res.status(400).json(createErrorResponse(ERROR_CODES.TOKEN_NOT_EXPIRED, 'Token has not expired yet.'));
      }

      // إذا كان التوكن منتهي، يتم إصدار توكن جديد
      const newToken = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: main().expiresIn });
      res.json(createSuccessResponse({ token: newToken }, 'Token updated'));
    });
  });
};


// Logout controller
const logout = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(createErrorResponse(ERROR_CODES.REFRESH_TOKEN_MISSING, ERROR_CODES.REFRESH_TOKEN_MISSING.message));
  }

  const refreshTokenRef = db.ref(`${path}/refreshTokens`).orderByChild('token').equalTo(refreshToken);
  refreshTokenRef.once('value', (snapshot) => {
    if (!snapshot.exists()) {
      return res.status(400).json(createErrorResponse(ERROR_CODES.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN.message));
    }

    const tokenKey = Object.keys(snapshot.val())[0];
    db.ref(`${path}/refreshTokens/${tokenKey}`).remove((error) => {
      if (error) {
        return res.status(500).json(createErrorResponse(ERROR_CODES.GENERAL_ERROR, 'Failed to logout.'));
      }
      res.json(createSuccessResponse({}, 'Logout successful, token invalidated!'));
    });
  });
};

module.exports = { signup, login, refreshToken: refreshTokenController, logout };
