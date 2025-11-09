'use strict';

exports.up = function (db, callback) {
  db.createTable('assignments', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: { type: 'string', notNull: true },
    description: { type: 'text' },
    start_date: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') },
    end_date: { type: 'timestamp' },
    state: { type: 'string' },
    link: { type: 'string' },
    comment: { type: 'string' },
    groupid: { type: 'int' }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('assignments', 'groups', 'fk_assignments_groups',
    { 'groupid': 'id' },
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('assignments', 'fk_assignments_groups', callback);
  db.dropTable('assignments', callback);
};

exports._meta = { version: 1 };
