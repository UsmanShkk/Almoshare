const express = require("express");
const multer = require("multer");
const { uploadFile } = require("@controllers/uploadController");

const router = express.Router();

// Store file in memory before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("profilePhoto"), uploadFile);

module.exports = router;
