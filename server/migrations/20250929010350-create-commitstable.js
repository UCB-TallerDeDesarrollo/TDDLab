'use strict';

exports.up = function (db) {
  return db.createTable('commitstable', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    owner: { type: 'string', notNull: true },
    reponame: { type: 'string', notNull: true },
    html_url: { type: 'text' },
    sha: { type: 'string', notNull: true },
    total: { type: 'int' },
    additions: { type: 'int' },
    deletions: { type: 'int' },
    message: { type: 'text' },
    url: { type: 'text' },
    comment_count: { type: 'int' },
    commit_date: { type: 'timestamp' },
    coverage: { type: 'string' },
    test_count: { type: 'string' },
    tdd_cycle: { type: 'text' }
  });
};

exports.down = function (db) {
  return db.dropTable('commitstable');
};

exports._meta = {
  "version": 1
};
