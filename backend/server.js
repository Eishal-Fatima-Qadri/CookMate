const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipes");
const ingredientRoutes = require("./routes/ingredients");
const path = require("path");
const app = express();

// Debug middleware - add this to see all incoming requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));

// Check database connection
app.use(async (req, res, next) => {
  try {
    req.pool = await poolPromise;
    next();
  } catch (err) {
    console.error("Database connection error", err);
    res.status(500).send("Server Error");
  }
});

// Set up API routes FIRST, before any static/catch-all routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/reviews", require("./routes/reviews"));

// API root response
app.get("/api", (req, res) => {
  res.json({ message: "API is running..." });
});

// Root route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Static files and catch-all
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("dist"));
  // Serve the index.html file for any route that doesn't match an API route
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
} else {
  // Development mode
  app.use(express.static(path.join(__dirname, "client/build")));
  // Catch-all for frontend routes in development
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/", "index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
// noinspection JSVoidFunctionReturnValueUsed
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
