'use strict';

exports.up = function (db, callback) {
  db.createTable('groups', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    groupname: { type: 'string', notNull: true },
    groupdetail: { type: 'text' },
    creationdate: { type: 'timestamp', defaultValue: String('CURRENT_TIMESTAMP') }
  }, { ifNotExists: true }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('groups', callback);
};

exports._meta = { version: 1 };
