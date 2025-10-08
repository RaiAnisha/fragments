// src/routes/api/post.js

//const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { writeFragment, writeFragmentData } = require('../../model/data/memory');
const logger = require('../../logger'); // if you have a logger helper, otherwise use console
//const contentType = require('content-type');
//const express = require('express');
//const { Fragment } = require('../model/fragment');

/**
 * Handle POST /v1/fragments
 */
module.exports = async (req, res) => {
  //try {
  const ownerId = req.user.id;
  // if (!ownerId) {
  //   logger.warn('Unauthorized request to POST /fragments');
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  //const type = req.get('Content-Type');
  //const content = req.body;
  const { type: fragmentType, data: content } = req.body || {};

  //jp const type = req.headers['content-type'] || 'text/plain';
  // try {
  //   ({ type } = contentType.parse(req));
  // } catch (err) {
  //   logger.warn(`Invalid content-type header: ${req.headers['content-type']}`);
  //   return res.status(400).json({ error: 'Invalid Content-Type header', err });
  // }
  console.log('req.user:', req.user); // ✅ this will print
  console.log('req.body:', req.body);

  try {
    // Expect JSON body: { type: 'text/plain', content: '...' }
    // const { type, content } = req.body || {};

    console.log('Received type:', fragmentType);
    console.log('Received content:', content);

    // Check if type is supported
    if (!fragmentType || !Fragment.isSupportedType(fragmentType)) {
      logger.warn(`Unsupported content type: ${fragmentType}`);
      return res.status(415).json({ error: `Unsupported Media Type: ${fragmentType}` });
    }

    if (!content || typeof content !== 'string') {
      logger.warn('Invalid or missing content');
      return res.status(400).json({ error: 'Invalid or missing content' });
    }

    const buffer = Buffer.from(content, 'utf-8');
    // Ensure body is a Buffer
    // if (!Buffer.isBuffer(req.body)) {
    //   logger.warn('Invalid or missing body data');
    //   return res.status(400).json({ error: 'Invalid or missing body data' });
    // }

    // Create new fragment
    const fragment = new Fragment({
      ownerId: req.user.claims.sub, //HEELOO
      type: fragmentType,
      size: buffer.length,
    });
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    logger.info(`Creating new fragment: ${fragment.id} for user ${ownerId}`);

    await writeFragment(fragment);
    await writeFragmentData(req.user.claims.sub, fragment.id, buffer);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

    logger.debug(`Fragment created with id ${fragment.id}`);

    return res.status(201).json(fragment);
  } catch (err) {
    logger.error(`Error creating fragment: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
