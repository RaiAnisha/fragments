// src/server.js
require('dotenv').config();
// Only print env vars when LOG_LEVEL is debug (last part for submission)
if (process.env.LOG_LEVEL === 'debug') {
  console.log('--- Environment Variables ---');
  console.log(JSON.stringify(process.env, null, 2)); // pretty-print
  console.log('-----------------------------');
}
// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    //console.log(`Server started on port ${port}`);
    logger.info(`Server started on port ${port}`);
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
