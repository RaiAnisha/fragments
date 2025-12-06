// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { writeFragment, writeFragmentData } = require('../../model/data');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const hash = require('../../hash'); // adjust path if needed

module.exports = async (req, res) => {
  try {
    //const ownerId = req.user.claims.sub; changed to the below
    const ownerId = hash(JSON.stringify(req.user.claims)); //JSON.stringify( neww
    console.log(req, res);

    // const contentType = req.get('Content-Type');

    // if (!contentType || !Fragment.isSupportedType(contentType)) {
    //   return res
    //     .status(415)
    //     .json(createErrorResponse(415, `Unsupported Media Type: ${contentType}`));
    // }
    let contentType = req.get('Content-Type') || '';

    if (!Fragment.isSupportedType(contentType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `Unsupported Media Type: ${contentType}`));
    }

    // req.body might be:
    // - Buffer
    // - object
    // - string
    let buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (typeof req.body === 'object' && req.body !== null) {
      buffer = Buffer.from(JSON.stringify(req.body));
    } else if (typeof req.body === 'string') {
      buffer = Buffer.from(req.body);
    } else {
      return res.status(400).json(createErrorResponse(400, 'Invalid or missing body data'));
    }

    if (!buffer || buffer.length === 0 || (Buffer.isBuffer(buffer) && buffer.toString() === '{}')) {
      return res.status(400).json(createErrorResponse(400, 'Invalid or missing body data'));
    }

    const fragment = new Fragment({
      ownerId,
      type: contentType,
      size: buffer.length,
    });

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
