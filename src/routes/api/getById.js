// // src/routes/api/getById.js
// const { Fragment } = require('../../model/fragment');
// const { createErrorResponse } = require('../../response');

// module.exports = async (req, res) => {
//   console.log('getById.js route IS HIT HERE!!');
//   console.log('req.params:', req.params);
//   console.log('req.user.claims.sub:', req.user?.claims?.sub);
//   try {
//     const { id } = req.params;
//     const ownerId = req.user?.claims?.sub;

//     if (!ownerId) {
//       console.error('No ownerId in request – user not authenticated');
//       return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
//     }

//     const fragment = await Fragment.byId(ownerId, id);

//     if (!fragment) {
//       console.error(`Fragment with id=${id} not found for owner=${ownerId}`);
//       return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
//     }

//     const data = await fragment.getData(); // Buffer

//     if (!data) {
//       console.error(`Fragment data empty for id=${id}, owner=${ownerId}`);
//       return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
//     }

//     res.set('Content-Type', fragment.type);
//     return res.status(200).send(data);
//   } catch (err) {
//     console.error('Unexpected error fetching fragment data:', err);
//     return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
//   }
// };

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

// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * GET /v1/fragments/:id
 * Returns the raw fragment data by default.
 * Optional ?metadata=true to return JSON metadata instead.
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.claims?.sub;

    if (!ownerId) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }

    const fragment = await Fragment.byId(ownerId, id).catch(() => null);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // If ?metadata=true, return metadata JSON
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

    // Otherwise, return raw fragment content
    const data = await fragment.getData();
    if (!data) {
      return res.status(404).json(createErrorResponse(404, 'Fragment data not found'));
    }

    res.set('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    console.error('Unexpected error fetching fragment data:', err);
    return res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
