const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users, getNextUserId } = require("../database");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already registered",
      });
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
      id: getNextUserId(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const createToken = (user) => {
      if (!process.env.JWT_SECRET) {
        const error = new Error("JWT secret is not configured");
        error.statusCode = 500;
        throw error;
      }

      return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
    };

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: sanitizeUser(user),
        token: createToken(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
