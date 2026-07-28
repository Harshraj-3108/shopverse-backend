// src/server.js

import app from './app.js';
import { env } from './config/environment.js';
import { connectDB } from './config/db.js';

// Connect to MongoDB Database Instance
connectDB();

// Initialize HTTP server
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server successfully launched in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
});

// Handle Unhandled Promise Rejections globally
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection! Safe shutting down server...', err);
  server.close(() => {
    process.exit(1);
  });
});
