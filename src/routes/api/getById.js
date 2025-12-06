//implementing sharp
// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const hash = require('../../hash');
const sharp = require('sharp'); // <-- image conversion

/**
 * GET /v1/fragments/:id
 * Handles both:
 *  - /v1/fragments/:id           raw fragment or ?metadata=true
 *  - /v1/fragments/:id.ext      converted fragment
 */
module.exports = async (req, res) => {
  try {
    let { id } = req.params;
    const ownerId = hash(JSON.stringify(req.user?.claims));

    if (!ownerId) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }

    // Detecting extension (.:ext part)
    let ext = null;
    if (id.includes('.')) {
      const parts = id.split('.');
      id = parts[0];
      ext = parts[1].toLowerCase();
    }

    const fragment = await Fragment.byId(ownerId, id).catch(() => null);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    if (req.query.metadata === 'true') {
      return res.status(200).json({
        status: 'ok',
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          type: fragment.type,
          size: fragment.size,
          created: fragment.created,
          updated: fragment.updated,
        },
      });
    }

    const data = await fragment.getData();
    if (!data) {
      return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
    }

    if (ext) {
      // Markdown -> HTML conversion
      if (ext === 'html' && fragment.mimeType === 'text/markdown') {
        const html = md.render(data.toString('utf-8'));
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      }

      // Supported conversions map
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

      const targetType = mimeMap[ext];
      if (!targetType) {
        return res.status(415).json(createErrorResponse(415, `Unsupported extension: .${ext}`));
      }

      // Image conversion using sharp
      const imageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (imageTypes.includes(fragment.mimeType)) {
        if (fragment.mimeType !== targetType) {
          const converted = await sharp(data).toFormat(targetType.split('/')[1]).toBuffer();
          res.setHeader('Content-Type', targetType);
          return res.status(200).send(converted);
        }
        // no conversion needed, send original
        res.setHeader('Content-Type', fragment.type);
        return res.status(200).send(data);
      }

      // Text / JSON conversions
      if (fragment.mimeType === targetType || fragment.formats.includes(targetType)) {
        res.setHeader('Content-Type', targetType);
        return res.status(200).send(data);
      }

      return res.status(415).json(createErrorResponse(415, `Conversion to .${ext} not supported`));
    }

    // Default: send original data with exact header
    res.setHeader('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    console.error('Unexpected error fetching fragment data:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
