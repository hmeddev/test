const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const { loginLimiter } = require('./middlewares/rateLimit');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const playerRoutes = require('./routes/player');
const userRoutes = require('./routes/user');
const keepRoutes = require('./routes/keep');

const path = require('path');

// Firebase Admin SDK


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['bbs-game.glitch.me'], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 60000 }
}));

// CSRF Protection
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });
// Routes

app.use('/auth', authRoutes);
app.use('/game', gameRoutes);
app.use('/player', playerRoutes);
app.use('/user',  userRoutes);
app.use('/keep',  keepRoutes);



// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
