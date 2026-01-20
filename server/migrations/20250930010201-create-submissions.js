'use strict';

exports.up = function (db, callback) {
  db.createTable('submissions', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    assignmentid: { type: 'int', notNull: true },
    userid: { type: 'int', notNull: true },
    status: { type: 'string', length: 20 },
    repository_link: { type: 'string', length: 255, notNull: true },
    start_date: { type: 'timestamp', defaultValue: String('CURRENT_TIMESTAMP') },
    end_date: { type: 'timestamp' },
    comment: { type: 'string', length: 255 }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('submissions', 'assignments', 'fk_submissions_assignments',
    { 'assignmentid': 'id' }, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' }, callback);

  db.addForeignKey('submissions', 'userstable', 'fk_submissions_users',
    { 'userid': 'id' }, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' }, callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('submissions', 'fk_submissions_assignments', callback);
  db.removeForeignKey('submissions', 'fk_submissions_users', callback);
  db.dropTable('submissions', callback);
};

exports._meta = { version: 1 };
