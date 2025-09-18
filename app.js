
require('module-alias/register');

const express = require("express");
const mongoose = require('mongoose');
const config = require('@config')

const app = express();

// Connect to MongoDB
mongoose.connect(config.database.mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📊 Database: ${config.database.mongoUri}`);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });


const authRoutes = require('@routes/auth');
const uploadRoutes = require("@routes/upload");
const settingsRoutes = require("@routes/settings");

app.use(express.json());


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Example route
app.get("/", (req, res) => {
  res.json({
    message: "Hello from Express backend!",
    environment: config.env,
  });
});



// Start server
app.listen(config.server.port, () => {
  console.log(
    `🚀 Server running at http://localhost:${config.server.port} in ${config.env} mode`
  );
});
