'use strict';


exports.up = function (db) {
  return db.createTable('feature_flags', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    feature_name: { type: 'string', notNull: true },
    is_enabled: { type: 'boolean', notNull: true, defaultValue: false }
  });
};

exports.down = function (db) {
  return db.dropTable('feature_flags');
};

exports._meta = {
  "version": 1
};
