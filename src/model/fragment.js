// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

// Allowed MIME types
const SUPPORTED_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('ownerId is required and must be a string');
    }

    if (!type || typeof type !== 'string') {
      throw new Error('type is required and must be a string');
    }

    const baseType = type.split(';')[0].trim();
    if (!SUPPORTED_TYPES.includes(baseType)) {
      throw new Error(`type must be one of: ${SUPPORTED_TYPES.join(', ')}`);
    }

    if (size < 0 || !Number.isInteger(size)) {
      throw new Error('size must be a non-negative integer');
    }

    this.id = id || randomUUID(); // <-- use imported randomUUID
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */

  static async byUser(ownerId, expand = false) {
    const results = (await listFragments(ownerId, true)) || [];

    if (expand) {
      return results.map((f) => {
        const frag = typeof f === 'string' ? new Fragment(JSON.parse(f)) : new Fragment(f);
        // convert instance to plain object
        return {
          id: frag.id,
          type: frag.type,
          size: frag.size,
          ownerId: frag.ownerId,
          created: frag.created,
          updated: frag.updated,
        };
      });
    }

    // Only return IDs
    return results
      .map((f) => {
        if (typeof f === 'string') {
          try {
            return JSON.parse(f).id;
          } catch {
            return undefined;
          }
        }
        if (f && f.id) return f.id;
        return undefined;
      })
      .filter(Boolean);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TIP: make sure you properly re-create a full Fragment instance after getting from db.
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment with id ${id} not found for owner ${ownerId}`);
    }
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return readFragment(ownerId, id).then((frag) => {
      if (frag && frag.ownerId === ownerId) {
        return deleteFragment(ownerId, id);
      }
    });
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */

  save() {
    this.updated = new Date().toISOString();

    return writeFragment({
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    });
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TIP: make sure you update the metadata whenever you change the data, so they match
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();

    await writeFragmentData(this.ownerId, this.id, data);
    await this.save();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const supported = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/plain', 'text/html'],
      'text/html': ['text/html', 'text/plain'],
      'application/json': ['application/json', 'text/plain'],
    };
    return supported[this.mimeType] || [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return ['text/plain', 'text/markdown', 'text/html', 'application/json'].includes(type);
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
