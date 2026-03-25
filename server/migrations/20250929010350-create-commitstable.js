'use strict';

exports.up = function (db, callback) {
  db.createTable('commitstable', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    submission_id: { type: 'int', notNull: true },
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
  }, { ifNotExists: true }, callback);

  db.addForeignKey('commitstable', 'submissions', 'fk_commits_submissions',
    { 'submission_id': 'id' },
    { onDelete: 'CASCADE', onUpdate: 'RESTRICT' }, callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('commitstable', 'fk_commits_submissions', callback);
  db.dropTable('commitstable', callback);
};

exports._meta = { version: 1 };
