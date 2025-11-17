// const passport = require('passport');

// const { createErrorResponse } = require('../response');
// const hash = require('../hash');
// const logger = require('../logger');

// /**
//  * @param {'bearer' | 'http'} strategyName - the passport strategy to use
//  * @returns {Function} - the middleware function to use for authentication
//  */
// module.exports = (strategyName) => {
//   return function (req, res, next) {
//     logger.debug(`Authenticating using strategy: ${strategyName}`);//new
//     /**
//      * Define a custom callback to run after the user has been authenticated
//      * where we can modify the way that errors are handled, and hash emails.
//      * @param {Error} err - an error object
//      * @param {string} email - an authenticated user's email address
//      */
//     function callback(err, user) {
//       logger.debug('Callback hit for authentication', { err, user });//new
//       if (err) {
//         logger.warn({ err }, 'error authenticating user');
//          console.log('AUTH ERROR:', err);//new
//         return next(createErrorResponse(500, 'Unable to authenticate user'));
//       }
//       const email = user?.email;
//       // Not authorized, return a 401
//       if (!email) {
//         return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
//       }

//       req.user = hash(email);

//       req.user = {
//         id: user.sub,
//         username: user['cognito:username'],
//         email,
//         hash: hash(email),
//         claims: user,
//       };
//       logger.debug({ email, hash: req.user }, 'Authenticated user');

//       next();
//     }

//     passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
//   };
// };

const passport = require('passport');
const { createErrorResponse } = require('../response');
const hash = require('../hash');
const logger = require('../logger');

/**
 * @param {'bearer' | 'http'} strategyName - the passport strategy to use
 * @returns {Function} - the middleware function to use for authentication
 */
module.exports = (strategyName) => {
  return function (req, res, next) {
    logger.debug(`Authenticating using strategy: ${strategyName}`);

    function callback(err, user) {
      logger.debug('Callback hit for authentication', { err, user });

      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next(createErrorResponse(500, 'Unable to authenticate user'));
      }

      if (!user) {
        return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      }

      const email = typeof user === 'string' ? user : user.email || user['cognito:username'];

      req.user = {
        id: typeof user === 'string' ? email : user.sub || email,
        username: typeof user === 'string' ? email : user['cognito:username'] || email,
        email,
        hash: hash(email),
        claims: user,
      };

      logger.debug({ reqUserHash: req.user.hash, reqUser: req.user }, 'Authenticated user object');
      next();
    }

    passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
  };
};
