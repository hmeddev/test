const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware للتحقق من المصادقة باستخدام JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'مصادقة مفقودة.' });
    }

    const token = authHeader.split(' ')[1];  // استخراج الرمز من ترويسة Authorization
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'رمز غير صالح.' });
        }
        req.user = user;  // حفظ بيانات المستخدم في الطلب
        next();  // الانتقال إلى الوظيفة التالية
    });
};

module.exports = authenticate;
