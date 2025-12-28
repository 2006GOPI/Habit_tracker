
require('dotenv').config();
const { User } = require('./models');
const { connectDB } = require('./config/db');

async function listUsers() {
    await connectDB();
    const users = await User.findAll();
    console.log('Users in DB:', users.map(u => u.email));
    process.exit();
}

listUsers();
