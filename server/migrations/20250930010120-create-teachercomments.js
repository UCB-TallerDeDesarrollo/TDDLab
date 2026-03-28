'use strict';

exports.up = function (db, callback) {
  db.createTable('teachercomments', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    submission_id: { type: 'int', notNull: true },
    teacher_id: { type: 'int', notNull: true },
    content: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('teachercomments', 'submissions', 'fk_teachercomments_submissions',
    { 'submission_id': 'id' }, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' }, callback);

  db.addForeignKey('teachercomments', 'userstable', 'fk_teachercomments_users',
    { 'teacher_id': 'id' }, { onDelete: 'CASCADE', onUpdate: 'RESTRICT' }, callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('teachercomments', 'fk_teachercomments_submissions', callback);
  db.removeForeignKey('teachercomments', 'fk_teachercomments_users', callback);
  db.dropTable('teachercomments', callback);
};

exports._meta = { version: 1 };
