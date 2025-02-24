const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

require('dotenv').config({path: path.join(__dirname,'./db.env')})
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = { pool };