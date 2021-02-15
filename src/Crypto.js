const CryptoNode = require('crypto');

/**
 * Crypto utilities
 */
class Crypto {
  /**
   * @param {string} scrambleKey
   */
  constructor(scrambleKey) {
    this._scrambleKey = scrambleKey;
  }

  /**
   * @param {string} type
   * @param {number} id
   * @return {string}
   */
  encodeItemId(type, id) {
    const itemKey = `${type}:${id}`;
    const key = this._scrambleKey;
    const cipher = CryptoNode.createCipheriv('aes-128-cbc',
        Buffer.from(key), Buffer.from(key));
    let encrypted = cipher.update(itemKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }

  /**
   * @param {string} type
   * @param {string} scrambled
   * @return {number|null}
   */
  decodeItemId(type, scrambled) {
    if (!scrambled) {
      return null;
    }
    let id = null;
    const key = this._scrambleKey;
    try {
      scrambled = scrambled.replace(/-/g, '+').replace(/_/g, '/');
      const encryptedText = Buffer.from(scrambled, 'base64');
      const decipher = CryptoNode.createDecipheriv('aes-128-cbc',
          Buffer.from(key), Buffer.from(key));
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      const x = decrypted.toString();
      const p = x.split(':');
      id = p[1];
      if (p[0] !== type) {
        id = null;
      }
    } catch (e) {
      // Do nothing
    }
    return id;
  }
}

module.exports = Crypto;
