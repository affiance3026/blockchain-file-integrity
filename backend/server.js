require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const userRoutes = require("./routes/userRoutes");
const verifierRoutes = require("./routes/verifierRoutes");
const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Database Connection
connectDB();


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/user", userRoutes);
app.use("/api/verifier", verifierRoutes);
// Test Route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});


// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});