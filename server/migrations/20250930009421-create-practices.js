'use strict';

exports.up = function (db, callback) {
  db.createTable('practices', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    creation_date: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') },
    state: { type: 'text', notNull: true },
    userid: { type: 'int', notNull: true }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('practices', 'userstable', 'fk_practices_users',
    { 'userid': 'id' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }, callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('practices', 'fk_practices_users', callback);
  db.dropTable('practices', callback);
};

exports._meta = { version: 1 };
