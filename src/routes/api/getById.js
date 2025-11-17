// src/routes/api/getById.js - works but returns wrong things
// const { Fragment } = require('../../model/fragment');
// const { createErrorResponse, createSuccessResponse } = require('../../response');

// /**
//  * GET /v1/fragments/:id
//  * Returns fragment metadata (JSON) OR raw data (Buffer) if query ?raw=true
//  */
// module.exports = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ownerId = req.user?.claims?.sub;

//     if (!ownerId) {
//       return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
//     }

//     const fragment = await Fragment.byId(ownerId, id).catch(() => null);

//     if (!fragment) {
//       console.error(`Fragment with id=${id} not found for owner=${ownerId}`);
//       return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
//     }

//     // If ?raw=true, send actual data with correct Content-Type
//     if (req.query.raw === 'true') {
//       const data = await fragment.getData(); // Buffer
//       if (!data) {
//         console.error(`Fragment data empty for id=${id}, owner=${ownerId}`);
//         return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
//       }
//       res.set('Content-Type', fragment.type);
//       return res.status(200).send(data);
//     }

//     // Otherwise, return fragment metadata
//     return res.status(200).json(
//       createSuccessResponse({
//         fragment: {
//           id: fragment.id,
//           ownerId: fragment.ownerId,
//           type: fragment.type,
//           size: fragment.size,
//           created: fragment.created,
//           updated: fragment.updated,
//         },
//       })
//     );
//   } catch (err) {
//     console.error('Unexpected error fetching fragment data:', err);
//     return res.status(500).json(createErrorResponse(500, 'Internal server error'));
//   }
// };
//*****************************************************************************************************
// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const hash = require('../../hash');
const contentType = require('content-type');

/**
 * GET /v1/fragments/:id
 * Handles both:
 *  - /v1/fragments/:id           raw fragment or ?metadata=true
 *  - /v1/fragments/:id.ext      converted fragment
 */
module.exports = async (req, res) => {
  try {
    let { id } = req.params;
    const ownerId = hash(req.user?.claims);

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
      //console.log(`[DEBUG] Extension detected: .${ext}`);

      // md to HTML conversion
      if (ext === 'html' && fragment.mimeType === 'text/markdown') {
        const html = md.render(data.toString('utf-8'));
        res.setHeader('Content-Type', 'text/html'); //changed
        return res.status(200).send(html);
      }

      // Supported conversions
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

      if (fragment.mimeType === targetType || fragment.formats.includes(targetType)) {
        res.setHeader('Content-Type', targetType); //changed
        return res.status(200).send(data);
      }

      return res.status(415).json(createErrorResponse(415, `Conversion to .${ext} not supported`));
    }

    // Case default - ensure exact header
    // if (fragment.type === 'text/plain') {
    //   res.set('Content-Type', 'text/plain'); // exact, no charset
    //   return res.status(200).send(data);
    // }

    // if (fragment.type === 'application/json') {
    //   res.set('Content-Type', 'application/json'); // exact
    //   return res.status(200).send(JSON.stringify(JSON.parse(data.toString())));
    // }

    // Case default
    // res.set('Content-Type', fragment.type);
    // return res.status(200).send(data);

    // const { type } = contentType.parse(fragment.type);
    // res.setHeader('Content-Type', type);
    // return res.status(200).send(data);

    res.setHeader('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    console.error('Unexpected error fetching fragment data:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
