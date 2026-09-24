const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required. Provide a Bearer token.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        status: "error",
        message: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticate };
