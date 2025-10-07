// src/routes/api/post.js

//const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { writeFragment, writeFragmentData } = require('../../model/data/memory');
const logger = require('../../logger'); // if you have a logger helper, otherwise use console

/**
 * Handle POST /v1/fragments
 */
module.exports = async (req, res) => {
  //try {
  const ownerId = req.user?.email;
  // if (!ownerId) {
  //   logger.warn('Unauthorized request to POST /fragments');
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  let type;
  // try {
  //   ({ type } = contentType.parse(req));
  // } catch (err) {
  //   logger.warn(`Invalid content-type header: ${req.headers['content-type']}`);
  //   return res.status(400).json({ error: 'Invalid Content-Type header', err });
  // }

  // Check if type is supported
  if (!Fragment.isSupportedType(type)) {
    logger.warn(`Unsupported content type: ${type}`);
    return res.status(415).json({ error: `Unsupported Media Type: ${type}` });
  }

  // Ensure body is a Buffer
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Invalid or missing body data');
    return res.status(400).json({ error: 'Invalid or missing body data' });
  }

  // Create new fragment
  const fragment = new Fragment({
    ownerId: req.user.sub, //badal rhi hu mai jp
    type,
    size: req.body.length,
  });

  logger.info(`Creating new fragment: ${fragment.id} for user ${ownerId}`);

  await writeFragment(fragment);
  await writeFragmentData(ownerId, fragment.id, req.body);

  const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
  res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

  logger.debug(`Fragment created with id ${fragment.id}`);

  return res.status(201).json(fragment);

  // } catch (err) {
  //   logger.error(`Error creating fragment: ${err.message}`);
  //   res.status(500).json({ error: 'Internal Server Error' });
  // }
};
