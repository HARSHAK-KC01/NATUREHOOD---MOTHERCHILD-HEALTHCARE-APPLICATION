const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

function createApiMiddleware() {
  const app = express();
  app.use(cors());

  // Parse JSON with custom error catcher
  app.use((req, res, next) => {
    express.json()(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload received in request body'
        });
      }
      next();
    });
  });

  app.use(express.urlencoded({ extended: true }));

  // Mount API routes
  app.use('/', apiRoutes);

  // Global Error Handler to ensure errors never bubble to Vite HMR overlay
  app.use((err, req, res, next) => {
    console.error('[Backend Middleware Error]:', err.message);
    if (!res.headersSent) {
      res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
      });
    }
  });

  return app;
}

module.exports = { createApiMiddleware };
