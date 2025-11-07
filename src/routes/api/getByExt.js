// src/routes/api/getByExt.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response'); // <-- include your helper
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

module.exports = async (req, res) => {
  console.log('anisha Rai before try!');
  try {
    // Extract route params directly from Express
    const { id, ext } = req.params;
    const ownerId = req.user.claims.sub;

    // DEBUG logs to confirm route is hit
    console.log('[DEBUG] getByExt route hit');
    console.log('[DEBUG] ownerId:', ownerId);
    console.log('[DEBUG] id:', id);
    console.log('[DEBUG] ext:', ext);

    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return createErrorResponse(res, 404, 'Fragment not found - ANISHA ');
    }

    const data = await fragment.getData();
    if (!data) {
      return createErrorResponse(res, 404, 'Fragment data not found - RAI');
    }

    // Markdown → HTML conversion if requested
    if (ext.toLowerCase() === 'html' && fragment.mimeType === 'text/markdown') {
      const html = md.render(data.toString('utf-8'));
      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    // Supported extensions → MIME mapping
    const mimeMap = {
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      json: 'application/json',
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
    };

    const candidateType = mimeMap[ext.toLowerCase()];
    if (!candidateType) {
      return createErrorResponse(res, 415, `Unsupported extension: .${ext}`);
    }

    // If fragment supports this format → send raw data
    if (fragment.formats.includes(candidateType) || fragment.mimeType === candidateType) {
      res.set('Content-Type', candidateType);
      return res.status(200).send(data);
    }

    // Conversion not supported
    return createErrorResponse(res, 415, `Conversion to .${ext} not supported`);
  } catch (err) {
    console.error('[ERROR] converting fragment:', err);
    return createErrorResponse(res, 500, 'Internal Server Error');
  }
};
