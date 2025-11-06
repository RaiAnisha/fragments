// src/server.js
require('dotenv').config();
// Only print env vars when LOG_LEVEL is debug (last part for submission)
// if (process.env.LOG_LEVEL === 'debug') {
//   console.log('--- Environment Variables ---');
//   console.log(JSON.stringify(process.env, null, 2)); // pretty-print
//   console.log('-----------------------------');
// }
// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// Only print env vars when in debug mode (for local dev only)
if (process.env.LOG_LEVEL === 'debug') {
  logger.debug('--- Environment Variables ---');
  Object.keys(process.env).forEach((key) => {
    if (!key.toLowerCase().includes('secret')) {
      logger.debug(`${key}=${process.env[key]}`);
    }
  });
  logger.debug('-----------------------------');
}

const server = stoppable(
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server started on port ${port}`);
  })
);

// Graceful shutdown on SIGTERM / SIGINT (important for Docker + CI)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received: shutting down gracefully...');
  server.stop(() => {
    logger.info('Server stopped. Bye!');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received: shutting down gracefully...');
  server.stop(() => {
    logger.info('Server stopped. Bye!');
    process.exit(0);
  });
});

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
