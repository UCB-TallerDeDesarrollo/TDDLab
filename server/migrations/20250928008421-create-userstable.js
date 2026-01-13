'use strict';

exports.up = function (db, callback) {
  db.createTable('userstable', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    email: { type: 'string', length: 255, notNull: true },
    role: { type: 'string', length: 255, notNull: true },
    groupid: { type: 'int' }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('userstable', 'groups', 'fk_users_groups',
    { 'groupid': 'id' },
    { onDelete: 'SET NULL', onUpdate: 'CASCADE' },
    callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('userstable', 'fk_users_groups', callback);
  db.dropTable('userstable', callback);
};

exports._meta = { version: 1 };
