import { Pool } from 'pg';

async function connectDB() {
    if(global.connection) {
        return global.connection.connect();
    };

    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    const client = await pool.connect();
    console.log("Pool created!");

    const res = await client.query("SELECT now();");
    console.log(res.rows[0]);
    client.release();

    global.connection = pool;
    return pool.connect();
};

export {
    connectDB
};
