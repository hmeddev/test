const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ status: false, error: "Authentication token missing." });
  }

  const token = authHeader; //.split(" ")[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err.name)
      if (err.name === "TokenExpiredError" || err.name === "jwt expired") {
        console.log("expired")
        // إذا انتهت صلاحية التوكن، نعيد رسالة مناسبة
        return res.status(401).json({ status: false, error: "Token expired" });
      }else
      return res.status(403).json({ status: false, error: "Invalid token." ,err });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticate };
