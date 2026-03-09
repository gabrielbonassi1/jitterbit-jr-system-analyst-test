// database.js

import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise();

const db = pgp({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'orders_db',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'admin123'
});

// test connection
db.connect()
  .then(obj => {
    console.log('Database connected successfully');
    obj.done();
  })
  .catch(error => {
    console.error('ERROR connecting to database:', error.message);
  });

export default db;
