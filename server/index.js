const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('dotenv').config();

const app = express();

const morgan = require('morgan');

const fs = require('fs');

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global Request Logger
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} BODY: ${JSON.stringify(req.body)}\n`;
    console.log('Global Log:', log);
    next();
});

const path = require('path');

// Routes Placeholder
// app.get('/', (req, res) => {
//     res.send('Habit Tracker API Running');
// });

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes (Must be before the catch-all)
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const moodRoutes = require('./routes/moodRoutes');
const healthRoutes = require('./routes/healthRoutes');
const historyRoutes = require('./routes/historyRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/history', historyRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/:path(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    try {
        // Sync models
        await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate
        console.log('Database Synced');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to sync database:', err);
    }
};

startServer();
