// //src/routes/api/get.js

// const { createSuccessResponse } = require('../../response');
// const { Fragment } = require('../../model/fragment');

// /**
//  * Get a list of fragments for the current user
//  */
// module.exports = async (req, res) => {
//   try {
//     // check query param: /v1/fragments?expand=1
//     //const expand = req.query.expand === '1';

//     // get fragments for this user
//     const fragments = await Fragment.byUser(req.user.claims.sub, true);

//     res.status(200).json(createSuccessResponse({ fragments }));
//   } catch (err) {
//     console.error('Error fetching fragments:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

module.exports = async (req, res) => {
  try {
    // Example: GET /fragments/:id.ext
    const { id, ext } = req.params;
    const fragment = await Fragment.byId(req.user.claims.sub, id);

    if (!fragment) {
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Step 21: Markdown conversion
    if (ext === 'html' && fragment.type.startsWith('text/markdown')) {
      const htmlContent = md.render(fragment.data);
      res.setHeader('Content-Type', 'text/html');
      return res.send(htmlContent);
    }

    // Default: return raw fragment data
    res.send(fragment.data);
  } catch (err) {
    console.error('Error fetching fragment:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
