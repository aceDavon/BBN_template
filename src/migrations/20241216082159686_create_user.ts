import { Pool } from 'pg';

const pool = new Pool();

export const up = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE user (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)
};

export const down = async (): Promise<void> => {
  await pool.query(`
    DROP TABLE user;
  `);
};
