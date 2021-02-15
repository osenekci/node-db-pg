const {Pool} = require('pg');
const Crypto = require('./Crypto');

/**
 * Pool manager
 */
class DbPool {
  /**
   * @param {*} options
   * @param {Object} logger
   * @param {string} scrambleKey
   */
  constructor(options, scrambleKey, logger) {
    this._pool = new Pool(options);
    this._logger = logger || console;
    this._crypto = new Crypto(scrambleKey);
  }

  /**
   * @return {Crypto}
   */
  getCrypto() {
    return this._crypto;
  }

  /**
   * @return {Promise<boolean>}
   */
  async end() {
    return new Promise((resolve) => {
      this._pool.end(() => {
        resolve(true);
      });
    });
  }

  /**
   * @return {Promise<boolean>}
   */
  async connect() {
    return new Promise((resolve) => {
      this._pool.connect((err) => {
        if (err) {
          this._logger.error(err.message);
        }
        resolve(!err);
      });
    });
  }

  /**
   * @param {string} query
   * @param {Array} [params]
   * @return {Promise<*>}
   */
  async query(query, params) {
    return new Promise((resolve) => {
      this._pool.query(query, params || [], (err, result) => {
        if (err) {
          this._logger.error(err.message);
          resolve(false);
          return;
        }
        resolve(result);
      });
    });
  }
}

module.exports = DbPool;
