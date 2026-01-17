const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'thananonchounudom',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ev_charging_db',
    port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        console.log('🛠 Running Schema Migration...');
        const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
        await client.query(schema);
        console.log('✅ Tables created successfully.');

        console.log('🌱 Seeding Data...');
        const seeds = fs.readFileSync(path.join(__dirname, 'db', 'seeds.sql'), 'utf8');
        await client.query(seeds);
        console.log('✅ Data seeded successfully.');

        client.release();
        console.log('🎉 Database setup complete!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
