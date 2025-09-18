const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("@config/s3");
const config   = require('@config')
const User = require("@models/User");



const uploadFile = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!req.body.id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const file = req.file;
    const fileName = `profiles/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: config.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // File URL
    const fileUrl = config.s3Link(fileName);
    console.log("File Url: ",fileUrl)

    // Save to MongoDB
    const updatedUser = await User.findByIdAndUpdate(
        req.body.id, 
        { photo: fileUrl },
        { new: true } // return updated user
      );
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const newPhoto = updatedUser.photo

    return res.json({
      message: "File uploaded successfully",
      photo: newPhoto,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

module.exports = { uploadFile };
