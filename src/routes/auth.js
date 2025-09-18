const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    loginWithGoogle,
    getContext,
    forgetPassword,
    resetPassword
  } = require("@controllers/auth.controllers");

  router.post("/register", registerUser);
  router.post("/login", loginUser);
  router.post("/login/google", loginWithGoogle);
  router.get("/context", getContext);
  router.post("/forget-password", forgetPassword);
  router.post("/reset-password/:token", resetPassword);
  module.exports = router;
