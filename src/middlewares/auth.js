const jwt = require("jsonwebtoken");
const config = require("@config");

/**
 * Middleware to check if user is authenticated
 */
exports.required = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    
    const token = authHeader?.split(" ")[1];
    console.log("Extracted token:", token);

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Verify token
    console.log("JWT Secret:", config.jwtSecret);
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("Decoded token:", decoded);

    // Add decoded user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
};