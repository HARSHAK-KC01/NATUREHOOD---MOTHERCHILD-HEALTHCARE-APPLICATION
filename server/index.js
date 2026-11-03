const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;

// Middlewares
app.use(cors());

// Safe JSON parser
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

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'Nurturehood Maternal & Child Healthcare Backend API is running',
    version: '2.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/health',
      '/api/patients',
      '/api/anc/visits',
      '/api/immunization/catalog',
      '/api/immunization/records',
      '/api/hospitals',
      '/api/analytics'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  Nurturehood Backend Server Live`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  Health API: http://localhost:${PORT}/api/health`);
    console.log(`  Patients API: http://localhost:${PORT}/api/patients`);
    console.log(`====================================================`);
  });
}

module.exports = app;
