'use strict';

exports.up = function (db, callback) {
  db.createTable('prompts_ia_temp_v2', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: { type: 'text', notNull: true },
    prompt: { type: 'text', notNull: true }
  }, { ifNotExists: true }, callback);
};

exports.down = function (db, callback) {
  db.dropTable('prompts_ia_temp_v2', callback);
};

exports._meta = { version: 1 };
