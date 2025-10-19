'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('assignments', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: { type: 'string', notNull: true },
    description: 'text',
    created_at: { type: 'datetime', notNull: true, defaultValue: new String('now()') }
  });
};

exports.down = function (db) {
  return db.dropTable('assignments');
};

exports._meta = {
  version: 1
};
