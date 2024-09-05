const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const csurf = require('csurf');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { signup, login, refreshToken, logout } = require('./authController');
const { updateUserData, getUserData } = require('./userController');
const authenticate = require('./authenticate');  // Middleware للمصادقة

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 60000 }
}));
app.use(csurf({ cookie: true }));

// الحد من الطلبات
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'لقد تجاوزت الحد الأقصى لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة.'
});

// مسارات
app.post('/signup', signup);
app.post('/login', loginLimiter, login);
app.post('/token', refreshToken);
app.post('/logout', logout);
app.put('/update', authenticate, updateUserData);
app.get('/user', authenticate, getUserData);

// بدء الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
