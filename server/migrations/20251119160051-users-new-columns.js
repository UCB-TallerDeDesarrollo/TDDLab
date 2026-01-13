'use strict';

exports.up = function (db) {
  const sql = `
    DO $$
    BEGIN
      -- first_name
      IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='first_name'
      ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR;
      END IF;

      -- last_name
      IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_name'
      ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR;
      END IF;
    END
    $$;
  `;
  
  return db.runSql(sql);
};

exports.down = function (db) {
  const sql = `
    ALTER TABLE users DROP COLUMN IF EXISTS first_name;
    ALTER TABLE users DROP COLUMN IF EXISTS last_name;
  `;

  return db.runSql(sql);
};

exports._meta = {
  "version": 1
};
