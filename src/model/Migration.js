const BaseModel = require('../BaseModel');

/**
 * Migration model
 */
class Migration extends BaseModel {
  /**
   * @return {*}
   */
  static getOptions() {
    return {
      table: 'db_migrations',
      encodeIdColumn: 'id',
      dates: true,
    };
  }
}

module.exports = Migration;
