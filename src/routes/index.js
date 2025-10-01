// // src/routes/index.js
// // Our authentication middleware
// const { authenticate } = require('../auth'); //step 62

// const express = require('express');

// // version and author from package.json
// const { version, author } = require('../../package.json');

// // Create a router that we can use to mount our API
// const router = express.Router();

// /**
//  * Expose all of our API routes on /v1/* to include an API version.
//  * Protect them all with middleware so you have to be authenticated
//  * in order to access things.
//  */
// router.use(`/v1`, authenticate(), require('./api'));

// /**
//  * Expose all of our API routes on /v1/* to include an API version.
//  */
// //router.use(`/v1`, require('./api'));

// /**
//  * Define a simple health check route. If the server is running
//  * we'll respond with a 200 OK.  If not, the server isn't healthy.
//  */
// router.get('/', (req, res) => {
//   // Client's shouldn't cache this response (always request it fresh)
//   res.setHeader('Cache-Control', 'no-cache');
//   // Send a 200 'OK' response
//   res.status(200).json({
//     status: 'ok',
//     author,
//     // Use your own GitHub URL for this!
//     githubUrl: 'https://github.com/RaiAnisha/fragments',
//     version,
//   });
// });

// module.exports = router;

// src/routes/index.js

// const { authenticate } = require('../auth');
// const express = require('express');
// const { createSuccessResponse } = require('../response'); // import the helper

// const { version, author } = require('../../package.json');
// const router = express.Router();

// router.use(`/v1`, authenticate(), require('./api'));

// // Health check route
// router.get('/', (req, res) => {
//   res.setHeader('Cache-Control', 'no-cache');
//   res.status(200).json(
//     createSuccessResponse({
//       author,
//       githubUrl: 'https://github.com/RaiAnisha/fragments',
//       version,
//     })
//   );
// });

// module.exports = router;

// src/routes/index.js
const { authenticate } = require('../auth');
const express = require('express');
const contentType = require('content-type');
const { createSuccessResponse } = require('../response');
const { version, author } = require('../../package.json');
const { Fragment } = require('../model/fragment');
const { writeFragment, writeFragmentData } = require('../model/data/memory/index');

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/RaiAnisha/fragments',
      version,
    })
  );
});

// Raw body parser
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const ct = req.headers['content-type'];
        const { type } = contentType.parse(ct);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

// POST /v1/fragments
router.post('/v1/fragments', authenticate(), rawBody(), async (req, res) => {
  try {
    const ownerId = req.user?.email;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const { type } = contentType.parse(req);

    // First check if the type is supported
    if (!Fragment.isSupportedType(type)) {
      console.error(`Unsupported content type: ${type}`);
      return res.status(415).json({ error: `Unsupported Media Type: ${type}` });
    }

    // Then make sure the body is a Buffer
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: 'Invalid or missing body data' });
    }

    // Set size here so tests pass
    const fragment = new Fragment({
      ownerId,
      type,
      size: req.body.length,
    });

    await writeFragment(fragment);
    await writeFragmentData(ownerId, fragment.id, req.body);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

    res.status(201).json(fragment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
