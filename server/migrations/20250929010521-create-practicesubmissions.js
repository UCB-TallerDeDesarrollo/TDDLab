'use strict';

exports.up = function (db, callback) {
  db.createTable('practicesubmissions', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    practiceid: { type: 'int', notNull: true },
    userid: { type: 'int', notNull: true },
    status: { type: 'text', notNull: true },
    repository_link: { type: 'text', notNull: true },
    start_date: { type: 'timestamp', notNull: true, defaultValue: String('CURRENT_TIMESTAMP') },
    end_date: { type: 'timestamp' },
    comment: { type: 'text' }
  }, { ifNotExists: true }, callback);

  db.addForeignKey('practicesubmissions', 'practices', 'fk_practicesubmissions_practices',
    { 'practiceid': 'id' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }, callback);

  db.addForeignKey('practicesubmissions', 'userstable', 'fk_practicesubmissions_users',
    { 'userid': 'id' }, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }, callback);
};

exports.down = function (db, callback) {
  db.removeForeignKey('practicesubmissions', 'fk_practicesubmissions_practices', callback);
  db.removeForeignKey('practicesubmissions', 'fk_practicesubmissions_users', callback);
  db.dropTable('practicesubmissions', callback);
};

exports._meta = { version: 1 };
