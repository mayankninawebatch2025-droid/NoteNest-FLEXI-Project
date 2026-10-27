const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  // Ensure database is connected before handling request
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Database connection error:', err.message);
    // Don't crash lambda; return informative error response
    if (req.url.includes('/api/health') || req.url === '/health') {
      return res.status(200).json({
        status: 'degraded',
        database: 'disconnected',
        message: 'Application is running but MongoDB connection failed. Please verify MONGODB_URI.',
        error: err.message,
      });
    }
  }

  // Pass request to Express app
  return app(req, res);
};

