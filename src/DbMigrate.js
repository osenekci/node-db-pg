const fs = require('fs');
const path = require('path');
const Repository = require('./Repository');
const Migration = require('./model/Migration');

/**
 * Database migration manager
 */
class DbMigrate {
  /**
   * @param {DbPool} pool
   * @param {string} migrationsFolder
   */
  constructor(pool, migrationsFolder) {
    this._pool = pool;
    this._migrationsFolder = migrationsFolder;
  }

  /**
   * @return {Promise<boolean>}
   */
  async migrate() {
    const files = fs.readdirSync(this._migrationsFolder);
    const internalFiles = fs.readdirSync(path.join(__dirname, 'migrations'));
    const mergedFiles = [...internalFiles, ...files];

    const repo = new Repository(this._pool, Migration);
    const migrations = await repo.find();

    const filesToMigrate = [];
    mergedFiles.forEach((file) => {
      const migration = migrations.find((row) => {
        return row.getData().name === file;
      });
      if (!migration) {
        filesToMigrate.push(file);
      }
    });

    for (let i = 0; i < filesToMigrate.length; i++) {
      const fileName = filesToMigrate[i];
      let p = null;
      if (fileName.indexOf('__internal') > 0) {
        p = path.join(__dirname, 'migrations', fileName);
      } else {
        p = path.join(this._migrationsFolder, fileName);
      }
      const sql = fs.readFileSync(p, 'utf8');
      const result = await this._pool.query(sql);
      if (!result) {
        continue;
      }
      const data = {
        name: fileName,
      };
      await repo.save(data);
    }
  }
}

module.exports = DbMigrate;
