'use strict';

exports.up = function (db, callback) {
  db.createTable('jobstable', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    sha: { type: 'string', notNull: true },
    owner: { type: 'string', notNull: true },
    reponame: { type: 'string', notNull: true },
    conclusion: { type: 'string' }
  }, { ifNotExists: true }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('jobstable', callback);
};

exports._meta = { version: 1 };
