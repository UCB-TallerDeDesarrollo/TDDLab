'use strict';



exports.up = function (db) {
  return db.createTable('commit_timeline', {
    execution_id: { type: 'int', primaryKey: true, autoIncrement: true },
    commit_sha: { type: 'string', notNull: true },
    execution_timestamp: { type: 'timestamp', notNull: true, defaultValue: String('NOW()') },
    number_of_tests: { type: 'int' },
    passed_tests: { type: 'int' },
    color: { type: 'string' },
    reponame: { type: 'string' },
    repoowner: { type: 'string' }
  });
};

exports.down = function (db) {
  return db.dropTable('commit_timeline');
};

exports._meta = {
  "version": 1
};
