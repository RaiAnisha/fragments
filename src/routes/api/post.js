// // src/routes/api/post.js

// //const contentType = require('content-type');
// const { Fragment } = require('../../model/fragment');
// const { writeFragment, writeFragmentData } = require('../../model/data/memory');
// const logger = require('../../logger'); // if you have a logger helper, otherwise use console

// //const express = require('express');
// //const { Fragment } = require('../model/fragment');

// /**
//  * Handle POST /v1/fragments
//  */
// module.exports = async (req, res) => {
//   const ownerId = req.user.id;
//   //const { type: fragmentType, data: content } = req.body || {};
//   const fragmentType = req.get('Content-Type'); // get type from HTTP header
//   const content = req.body.data; // only content comes from client

//   console.log('req.user:', req.user); //debugging
//   console.log('req.body:', req.body);

//   try {
//     // Expect JSON body: { type: 'text/plain', content: '...' }

//     console.log('Received type:', fragmentType); //debugging
//     console.log('Received content:', content);

//     // type is supported?
//     if (!fragmentType || !Fragment.isSupportedType(fragmentType)) {
//       logger.warn(`Unsupported content type: ${fragmentType}`);
//       return res.status(415).json({ error: `Unsupported Media Type: ${fragmentType}` });
//     }

//     if (!content) {
//       logger.warn('Invalid or missing content');
//       return res.status(400).json({ error: 'Invalid or missing content' });
//     }

//     const buffer = Buffer.from(content, 'utf-8');

//     // Create new fragment
//     const fragment = new Fragment({
//       ownerId: req.user.claims.sub,
//       type: fragmentType,
//       size: buffer.length,
//     });
//     console.log('req.user:', req.user); // debugging
//     console.log('req.body:', req.body);

//     logger.info(`Creating new fragment: ${fragment.id} for user ${ownerId}`);

//     await writeFragment(fragment);
//     await writeFragmentData(req.user.claims.sub, fragment.id, buffer);

//     const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
//     res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

//     logger.debug(`Fragment created with id ${fragment.id}`);

//     return res.status(201).json(fragment);
//   } catch (err) {
//     logger.error(`Error creating fragment: ${err.message}`);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// src/routes/api/post.js
// const { Fragment } = require('../../model/fragment');
// const { writeFragment, writeFragmentData } = require('../../model/data/memory');

// const logger = require('../../logger');

// /**
//  * Handle POST /v1/fragments
//  */
// module.exports = async (req, res) => {
//   try {
//     const contentType = req.get('Content-Type');
//     const ownerId = req.user.claims.sub;

//     // Validate content type
//     if (!contentType || !Fragment.isSupportedType(contentType)) {
//       return res.status(415).json({ error: `Unsupported Media Type: ${contentType}` });
//     }

//     // Extract body (can be buffer or JSON/text)
//     let bodyData;
//     if (Buffer.isBuffer(req.body)) {
//       bodyData = req.body;
//     } else if (typeof req.body === 'object') {
//       bodyData = Buffer.from(JSON.stringify(req.body));
//     } else if (typeof req.body === 'string') {
//       bodyData = Buffer.from(req.body);
//     } else {
//       return res.status(400).json({ error: 'Invalid body data' });
//     }

//     const fragment = new Fragment({
//       ownerId,
//       type: contentType,
//       size: bodyData.length,
//     });

//     await writeFragment(fragment);
//     await writeFragmentData(ownerId, fragment.id, bodyData);

//     const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
//     res
//       .status(201)
//       .set('Location', `${baseUrl}/v1/fragments/${fragment.id}`)
//       .json({
//         status: 'ok',
//         fragment: {
//           id: fragment.id,
//           ownerId: fragment.ownerId,
//           type: fragment.type,
//           size: fragment.size,
//           created: fragment.created,
//           updated: fragment.updated,
//         },
//       });
//   } catch (err) {
//     logger.error(`Error creating fragment: ${err.message}`);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { writeFragment, writeFragmentData } = require('../../model/data');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user.claims.sub; // authenticated owner id
    const contentType = req.get('Content-Type');

    if (!contentType || !Fragment.isSupportedType(contentType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `Unsupported Media Type: ${contentType}`));
    }

    // req.body might be:
    // - Buffer (when using express.raw() middleware)
    // - object (when JSON parsed by express.json())
    // - string (if text parser used)
    let buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (typeof req.body === 'object' && req.body !== null) {
      // For JSON body, want to store the raw JSON string
      buffer = Buffer.from(JSON.stringify(req.body));
    } else if (typeof req.body === 'string') {
      buffer = Buffer.from(req.body);
    } else {
      return res.status(400).json(createErrorResponse(400, 'Invalid or missing body data'));
    }

    const fragment = new Fragment({
      ownerId,
      type: contentType,
      size: buffer.length,
    });

    // persist metadata and data
    await writeFragment(fragment);
    await writeFragmentData(ownerId, fragment.id, buffer);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

    return res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('Error creating fragment:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
