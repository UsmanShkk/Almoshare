const jwt = require("jsonwebtoken");
const config = require("@config");

/**
 * Middleware to check if user is authenticated
 */
exports.required = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Add decoded user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
};