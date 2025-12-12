'use strict';

exports.up = function (db, callback) {
  db.createTable('commit_timeline', {
    execution_id: { type: 'int', primaryKey: true, autoIncrement: true },
    commit_sha: { type: 'string', notNull: true },
    execution_timestamp: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') },
    number_of_tests: { type: 'int' },
    passed_tests: { type: 'int' },
    color: { type: 'string' },
    reponame: { type: 'string' },
    repoowner: { type: 'string' }
  }, { ifNotExists: true }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('commit_timeline', callback);
};

exports._meta = { version: 1 };
