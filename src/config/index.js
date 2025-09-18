// config/index.js
const dotenv = require("dotenv");

// Load environment variables from .env (default)
dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  server: {
    port: process.env.PORT || 3000,
  },
  database: {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/Almoshare",
  },
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
  EMAIL_USER:process.env.EMAIL_USER ,
  EMAIL_PASS:process.env.EMAIL_PASS ,
  s3Link(fileName) {
    return `https://${this.AWS_BUCKET_NAME}.s3.${this.AWS_REGION}.amazonaws.com/${fileName}`;
  },  



};

module.exports = config;
