const express = require('express');
const cors = require('cors');
const { applyRoutes } = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Register routes
applyRoutes(app);

// Global error handler (should be last)
app.use(errorHandler);

module.exports = { app };


