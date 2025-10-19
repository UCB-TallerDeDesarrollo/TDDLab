'use strict';


exports.up = function (db) {
  return db.createTable('assignments', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: { type: 'string', notNull: true },
    description: { type: 'text' },
    start_date: { type: 'date' },
    end_date: { type: 'date' },
    state: { type: 'string' },
    link: { type: 'string' },
    comment: { type: 'string' },
    groupid: { type: 'int' }
  });
};

exports.down = function (db) {
  return db.dropTable('assignments');
};

exports._meta = {
  "version": 1
};
