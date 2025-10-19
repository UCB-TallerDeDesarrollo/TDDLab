'use strict';


exports.up = function (db) {
  return db.createTable('groups', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    groupname: { type: 'string', notNull: true },
    groupdetail: { type: 'text' },
    creationdate: { type: 'date' }
  });
};

exports.down = function (db) {
  return db.dropTable('groups');
};

exports._meta = {
  "version": 1
};
