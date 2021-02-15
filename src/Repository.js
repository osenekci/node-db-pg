/**
 * Base repo
 */
class Repository {
  /**
   * @param {DbPool} pool
   * @param {Function} modelCls
   */
  constructor(pool, modelCls) {
    this._pool = pool;
    this._modelCls = modelCls;
  }

  /**
   * @param {Object} [cond]
   * @param {Object} [opts]
   */
  async find(cond, opts) {
    // TODO::: implement opts
    const options = this._modelCls.getOptions();
    if (typeof cond === 'undefined') {
      const result = await this._query(`SELECT * FROM ${options.table}`);
      if (result && result.rows) {
        return this._mapToModel(result.rows, options);
      }
      return [];
    }
    const encCol = options.encodeIdColumn;
    if (cond[encCol]) {
      cond[encCol] = this._pool.getCrypto().decodeItemId(options.table, cond[encCol]);
    }
    const queryCond = [];
    const condValues = [];
    let increment = 1;
    for (const key in cond) {
      if (Object.hasOwnProperty.call(cond, key)) {
        queryCond.push(`${key} = $${increment}`);
        condValues.push(cond[key]);
        increment++;
      }
    }
    const queryString = queryCond.join(' AND ');
    const result = await this._query(
        `SELECT * FROM ${options.table} WHERE ${queryString}`, condValues);
    if (result && result.rows) {
      return this._mapToModel(result.rows, options);
    }
  }

  /**
   * @param {Object} cond
   */
  async findOne(cond) {
    const result = await this.find(cond, {
      limit: 1,
    });
    if (result.length > 0) {
      return result[0];
    }
    return null;
  }

  /**
   * @param {string} id
   * @return {Promise<void>}
   */
  async findById(id) {
    return this.findOne({
      id: id,
    });
  }

  /**
   * @param {Object} obj
   * @param {Object} [opts]
   * @return {*}
   */
  async save(obj, opts) {
    const options = this._modelCls.getOptions();
    const primaryCol = options.primaryKey || 'id';
    const optsString = opts ? ` ${this._compileOpts(opts)}` : '';
    // TODO:::
    if (obj[primaryCol]) {

    }
    if (options.dates) {
      obj.ts_created = Date.now();
      obj.ts_updated = Date.now();
    }
    const keys = Object.keys(obj);
    const keyParts = [];
    const valueParts = [];
    for (let i = 0; i < keys.length; i++) {
      const counter = i + 1;
      const key = keys[i];
      keyParts.push(`${key}`);
      valueParts.push(`$${counter}`);
    }

    const query = `INSERT INTO ${options.table}(${keyParts.join(',')}) VALUES(${valueParts.join(',')})${optsString}`; // eslint-disable-line
    const result = await this._query(query, Object.values(obj));
    if (!result) {
      return false;
    }
    const encCol = options.encodeIdColumn;
    if (result && result.rows && result.rows.length > 0 && encCol) {
      for (let i = 0; i < result.rows.length; i++) {
        if (result.rows[i][encCol]) {
          result.rows[i][encCol] = this._pool.getCrypto()
              .encodeItemId(options.table, result.rows[i][encCol]);
        }
      }
      return result.rows;
    }
    return result.rowCount !== 0;
  }

  /**
   * @param {number} id
   */
  async remove(id) {

  }

  /**
   * @param {Object} opts
   * @return {string}
   * @private
   */
  _compileOpts(opts) {
    const query = [];
    if (typeof opts.limit !== 'undefined') {
      query.push(`LIMIT=${opts.limit}`);
    }
    if (typeof opts.returning !== 'undefined') {
      query.push(`returning ${opts.returning}`);
    }
    return query.join(' ');
  }

  /**
   * @param {Array} rows
   * @param {Object} options
   * @return {Array}
   * @private
   */
  _mapToModel(rows, options) {
    const encCol = options.encodeIdColumn;
    return rows.map((row) => {
      let encColValue = null;
      if (row[encCol]) {
        encColValue = row[encCol];
        row[encCol] = this._pool.getCrypto().encodeItemId(options.table, row[encCol]);
      }
      const Model = this._modelCls;
      return new Model(row, encColValue);
    });
  }

  /**
   * @param {string} query
   * @param {Array} [params]
   * @return {Promise<*>}
   * @private
   */
  async _query(query, params) {
    return this._pool.query(query, params || []);
  }
}

module.exports = Repository;
