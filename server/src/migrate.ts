import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db.js';

// this will automatically run needed migrations on the database
const main = async () => {
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migrations failed!', error);
    process.exit(1);
  }
};

main();
