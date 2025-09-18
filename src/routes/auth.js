const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    loginWithGoogle,
    getContext
  } = require("@controllers/auth.controllers");

  router.post("/register", registerUser);
  router.post("/login", loginUser);
  router.post("/login/google", loginWithGoogle);
  router.get("/context", getContext);
  
  module.exports = router;
