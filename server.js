const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const csurf = require('csurf');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// إعداد تطبيق Express
const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret'; // مفتاح سري لـ refresh tokens

// قاعدة بيانات مؤقتة للمستخدمين (في الذاكرة)
let users = [];
let refreshTokens = [];

// Middleware لتحليل البيانات الواردة
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware للجلسات
app.use(session({
    secret: 'session_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // يجب أن تكون `true` إذا كنت تستخدم HTTPS
}));

// حماية CSRF
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// الحد من محاولات تسجيل الدخول (حماية من القوة الغاشمة)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 دقيقة
    max: 5,  // 5 محاولات كحد أقصى
    message: 'لقد تجاوزت الحد الأقصى لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة.'
});

// 1. إنشاء حساب جديد مع UID عشوائي
app.post('/signup', async (req, res) => {
    // التحقق من صحة المدخلات باستخدام Joi
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = req.body;

    // التحقق من عدم وجود المستخدم مسبقًا
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'اسم المستخدم مسجل مسبقًا.' });
    }

    // تجزئة كلمة المرور (Salt Rounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء معرف فريد (UID)
    const uid = uuidv4();

    // إضافة المستخدم الجديد إلى قاعدة البيانات المؤقتة
    const newUser = { uid, username, password: hashedPassword };
    users.push(newUser);

    res.json({ message: 'تم إنشاء الحساب بنجاح!', uid });
});

// 2. تسجيل الدخول
app.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // التحقق من صحة المدخلات باستخدام Joi
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    // البحث عن المستخدم
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ error: 'بيانات تسجيل الدخول غير صحيحة.' });
    }

    // التحقق من كلمة المرور
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'بيانات تسجيل الدخول غير صحيحة.' });
    }

    // إنشاء JWT
    const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ uid: user.uid }, REFRESH_TOKEN_SECRET);

    // تخزين الـ Refresh token
    refreshTokens.push(refreshToken);

    // إرسال الرموز
    res.json({ message: 'تم تسجيل الدخول بنجاح!', token, refreshToken });
});

// 3. تحديث رمز JWT باستخدام Refresh Token
app.post('/token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: 'رمز تحديث غير صالح.' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'رمز تحديث غير صالح.' });
        }

        const newToken = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: newToken });
    });
});

// Middleware للتحقق من المصادقة (JWT)
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'مصادقة مفقودة.' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'رمز غير صالح.' });
        }
        req.user = user;
        next();
    });
};

// 4. تحديث بيانات المستخدم (مثل الاسم)
app.put('/update', authenticate, (req, res) => {
    const { username } = req.body;

    // التحقق من صحة المدخلات باستخدام Joi
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    // البحث عن المستخدم باستخدام UID
    const user = users.find(u => u.uid === req.user.uid);
    if (!user) {
        return res.status(404).json({ error: 'المستخدم غير موجود.' });
    }

    // تحديث اسم المستخدم
    user.username = username;

    res.json({ message: 'تم تحديث البيانات بنجاح!', user });
});

// 5. تسجيل الخروج وإزالة Refresh Token
app.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.json({ message: 'تم تسجيل الخروج بنجاح!' });
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
