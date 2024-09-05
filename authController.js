const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const db = require('./firebase');  // Firebase الاتصال بقاعدة بيانات 

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
let refreshTokens = [];

// 1. تسجيل مستخدم جديد
const signup = async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, password } = req.body;
    
    const usersRef = db.ref('users');
    const existingUserSnapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
    
    if (existingUserSnapshot.exists()) {
        return res.status(400).json({ error: 'اسم المستخدم مسجل مسبقًا.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const uid = uuidv4();
    const newUser = { uid, username, password: hashedPassword, role: 'USER' };

    await usersRef.child(uid).set(newUser);
    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح!', uid });
};

// 2. تسجيل الدخول
const login = async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, password } = req.body;
    
    const usersRef = db.ref('users');
    const userSnapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
    
    if (!userSnapshot.exists()) return res.status(400).json({ error: 'بيانات تسجيل الدخول غير صحيحة.' });

    const userData = Object.values(userSnapshot.val())[0];  // استخراج بيانات المستخدم
    const validPassword = await bcrypt.compare(password, userData.password);

    if (!validPassword) return res.status(400).json({ error: 'بيانات تسجيل الدخول غير صحيحة.' });

    const token = jwt.sign({ uid: userData.uid, role: userData.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ uid: userData.uid, role: userData.role }, REFRESH_TOKEN_SECRET);

    refreshTokens.push(refreshToken);
    res.json({ message: 'تم تسجيل الدخول بنجاح!', token, refreshToken });
};

// 3. تحديث الرمز باستخدام Refresh Token
const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: 'رمز تحديث غير صالح.' });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'رمز تحديث غير صالح.' });

        const newToken = jwt.sign({ uid: user.uid, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: newToken });
    });
};

// 4. تسجيل الخروج
const logout = (req, res) => {
    const { refreshToken } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.json({ message: 'تم تسجيل الخروج بنجاح!' });
};

module.exports = { signup, login, refreshToken, logout };
