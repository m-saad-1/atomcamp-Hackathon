import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function run() {
  const client = new Client({
    host: '2406:da18:1f7e:b102:f8de:9ffe:4ebc:6c31',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Recruiting_agent23305',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected via IPv6!');
    
    const migration = fs.readFileSync('./supabase/migrations/010_sprint_5_vector_store.sql', 'utf8');
    
    console.log('Executing migration...');
    await client.query(migration);
    console.log('Migration executed successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
