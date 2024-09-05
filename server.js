const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const { RedisStore } = require('connect-redis'); 
const csrf = require('csurf');
const { loginLimiter } = require('./middlewares/rateLimit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// Firebase Admin SDK

// إنشاء عميل Redis
// const redisClient = Redis.createClient();

// إعداد RedisStore باستخدام connect-redis


const app = express();
const PORT = process.env.PORT || 3000;
const redisClient = redis.createClient({
    host: 'redis-19105.c300.eu-central-1-1.ec2.redns.redis-cloud.com',  // أو رابط Redis إذا كان مستضافًا في مكان آخر
    port: 19105          // المنفذ الافتراضي لـ Redis
});
redisClient.on('error', function (err) {
    console.error('Could not connect to Redis', err);
});

// Middleware
app.use(helmet());
app.use(cors({ origin: ['upbeat-hickory-expansion.glitch.me'], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 60000 }  // زيادة الأمان باستخدام httpOnly
}));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Routes
app.use('/auth', authRoutes);
app.use('/user', loginLimiter, userRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
