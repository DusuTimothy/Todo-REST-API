const jwt = require("jsonwebtoken");
const { Users } = require("../../models");

const authenticate = async (req, res, next) => {
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

  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT secret is not configured");
    error.statusCode = 500;
    return next(error);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  if (typeof decoded !== "object" || typeof decoded.id !== "number") {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await Users.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }

    req.user = { id: user.id, email: user.email, name: user.name };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { authenticate };
