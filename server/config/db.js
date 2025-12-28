const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            logging: false
        }
    );

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database Connected...');
    } catch (err) {
        console.error('Unable to connect to the database:', err.message);
        // Attempt to create database if it doesn't exist (optional simple check)
    }
};

module.exports = { sequelize, connectDB };
