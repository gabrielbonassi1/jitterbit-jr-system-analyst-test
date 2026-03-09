// database.test.js

import db from './database.js';

console.log('TEST: Testing database.js\n');

db.one('SELECT NOW() as current_time')
  .then(result => {
    console.log('TEST: Database connection successful');
    console.log('TEST: Current time from database:', result.current_time);
    process.exit(0);
  })
  .catch(error => {
    console.error('TEST: Database connection failed:', error.message);
    process.exit(1);
  });
