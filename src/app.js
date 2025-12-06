const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

const logger = require('./logger');
const pino = require('pino-http')({ logger });

const { createSuccessResponse } = require('./response');
const { version, author } = require('../package.json'); ////new to make it work on localhost

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}; //new to post drag drop

const app = express();
//app.use(cors());
app.use(cors(corsOptions)); //new to post drag drop
app.use(pino);
app.use(helmet());

app.use(compression());
const authenticate = require('./auth');
const { createErrorResponse } = require('./response');
// Passport auth
passport.use(authenticate.strategy());
app.use(passport.initialize());
//app.use(express.json());
//app.use('/v1', express.json());

//app.get('/v1/test', (req, res) => res.json({ ok: true })); //test
// Handle CORS preflight requests dynamically
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// Routes
app.use(express.raw({ type: '*/*', limit: '20mb' }));
app.use('/v1', require('./routes'));

app.get('/', (req, res) => {
  //to make it work on localhost
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/RaiAnisha/fragments',
      version,
    })
  );
});

app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message));
});
const { Fragment } = require('./model/fragment');
console.log('SUPPORTED TYPES!:', Fragment.supportedTypes);

module.exports = app;
