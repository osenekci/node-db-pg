/**
 * Base model
 */
class BaseModel {
  /**
   * @param {*} data
   * @param {number} encodedColValue
   */
  constructor(data, encodedColValue) {
    this._encodedColValue = encodedColValue || null;
    this._data = data;
  }

  /**
   * @return {number}
   */
  getEncodedColValue() {
    return this._encodedColValue;
  }

  /**
   * @return {*}
   */
  getData() {
    return this._data;
  }

  /**
   * @return {{
   *   table:string,
   * } | null}
   */
  static getOptions() {
    throw new Error('Override getOptions method in your model.');
  }
}

module.exports = BaseModel;
