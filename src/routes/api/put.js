//src/routes/api/put.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const hash = require('../../hash');

module.exports = async (req, res) => {
  console.log('PUT /fragments/:id hit', req.params, req.url);

  try {
    const ownerId = hash(JSON.stringify(req.user.claims));
    const { id } = req.params;

    // Load existing fragment
    const fragment = await Fragment.byId(ownerId, id).catch(() => null);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Validate Content-Type matches existing fragment
    const contentType = req.get('Content-Type');
    if (!contentType || fragment.mimeType !== contentType.split(';')[0]) {
      return res
        .status(400)
        .json(
          createErrorResponse(400, `Content-Type mismatch. Fragment type is ${fragment.mimeType}`)
        );
    }

    // Convert body to buffer
    let buffer;
    if (Buffer.isBuffer(req.body)) buffer = req.body;
    else if (typeof req.body === 'object' && req.body !== null)
      buffer = Buffer.from(JSON.stringify(req.body));
    else if (typeof req.body === 'string') buffer = Buffer.from(req.body);
    else {
      return res.status(400).json(createErrorResponse(400, 'Invalid body data'));
    }

    // Update fragment data and metadata
    await fragment.setData(buffer);

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('PUT /fragments/:id error:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
