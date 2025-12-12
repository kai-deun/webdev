const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// 1. setting up the middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIG,
    credentials: true,
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// 2. routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// 3. for health checking
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// 4. for 404 error
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    })
});

// 5. err handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    resizeTo.status(500).json({
        success: false,
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`\nEnv: ${process.env.NODE_ENV}`);
    console.log(`\nDatabase: ${process.env.DB_NAME}\n`);
});