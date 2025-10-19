'use strict';


exports.up = function (db) {
  return db.createTable('jobstable', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    sha: { type: 'string', notNull: true },
    owner: { type: 'string', notNull: true },
    reponame: { type: 'string', notNull: true },
    conclusion: { type: 'string' }
  });
};

exports.down = function (db) {
  return db.dropTable('jobstable');
};

exports._meta = {
  "version": 1
};
