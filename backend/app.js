require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Routers
const itemRouter = require("./Routes/ItemRoute");

// Middleware
app.use(express.json());
app.use(cors()); // You can restrict origins here if needed

// Health check route
app.get("/", (req, res) => {
  res.send("Home Inventory API is running!");
});

// API Routes
app.use("/api/items", itemRouter); // Example: http://localhost:5000/api/items

// Configuration
const PORT = process.env.PORT ;
const MONGO_URL =process.env.MONGO_URL ; // Add DB name if not set
const DEV_MODE = process.env.DEV_MODE || "development";

// Optional: enable strictQuery mode
mongoose.set("strictQuery", true);

// MongoDB Connection
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running in ${DEV_MODE} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Exit app on DB connection failure
  });