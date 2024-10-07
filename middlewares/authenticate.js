// authenticate.js

const jwt = require("jsonwebtoken");
const { createErrorResponse } = require('../lib/Handler');
const ERROR_CODES = require('../lib/errorCodes');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
// الحصول على عنوان IP من رؤوس الطلب
function getClientIp(req) {
    // إذا كان التطبيق خلف وكيل عكسي مثل Nginx
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // يمكن أن يحتوي على سلسلة من عناوين IP، نستخدم الأول منها
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        return ips[0];
    }
    // إذا لم يكن هناك وكيل عكسي
    return req.ip || req.connection.remoteAddress;
}
   const xForwardedFor = req.headers;
console.log(getClientIp(req))
  console.log(xForwardedFor)
  if (!authHeader) {
    return res
      .status(401)
      .json(createErrorResponse(ERROR_CODES.TOKEN_MISSING, ERROR_CODES.TOKEN_MISSING.message));
  }

  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError" || err.name === "jwt expired") {
        // إذا انتهت صلاحية التوكن، نعيد رسالة مناسبة
        return res.status(401).json(createErrorResponse(ERROR_CODES.SESSION_EXPIRED, ERROR_CODES.SESSION_EXPIRED.message));
      } else {
        return res.status(403).json(createErrorResponse(ERROR_CODES.INVALID_TOKEN, ERROR_CODES.INVALID_TOKEN.message));
      }
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticate };
