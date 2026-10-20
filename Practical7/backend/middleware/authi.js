const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const match = authHeader?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      status: 401,
      message: "Authorization header must use Bearer <token>",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      status: 500,
      message: "Authentication is not configured",
    });
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      status: 401,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;