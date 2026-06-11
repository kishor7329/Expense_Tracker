require("dotenv").config({ path: "../../.env" });
 

console.log("API Key exists?", process.env.MISTRAL_API_KEY ? "YES" : "NO");

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const sequelize = require("./config/database");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const app = express();
const goalsRoutes = require("./routes/goals");
const notesRoutes = require("./routes/notes");
const calendarRoutes = require("./routes/calendar");
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5001",
    credentials: true,
  }),
);
app.use(express.json());

const aiAssistantRoutes = require("./routes/aiAssistant");

app.use("/api/ai", aiAssistantRoutes);

app.use(
  session({
    secret: process.env.JWT_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require("./config/passport")(passport);

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/calendar", calendarRoutes);
// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });
