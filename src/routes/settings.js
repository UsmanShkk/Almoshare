const express = require("express");
const router = express.Router();
const {
  changePassword,
  updateProfile,
  getProfile
} = require("@controllers/settings.controller");
const { required } = require("@middlewares/auth");

// Apply auth middleware to all routes
router.use(required);

// Settings routes
router.post("/change-password", changePassword);
router.put("/update-profile", updateProfile);
router.get("/profile", getProfile);

module.exports = router;