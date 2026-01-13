'use strict';

exports.up = function (db, callback) {
  db.createTable('feature_flags', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    feature_name: { type: 'string', notNull: true },
    is_enabled: { type: 'boolean', notNull: true, defaultValue: false }
  }, { ifNotExists: true }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('feature_flags', callback);
};

exports._meta = { version: 1 };
