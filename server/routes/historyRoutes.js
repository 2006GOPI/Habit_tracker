const express = require('express');
const router = express.Router();
const { FocusLog, HealthEntry, HabitLog, Habit } = require('../models');
const auth = require('../middleware/authMiddleware');

// @route   GET api/history/focus
// @desc    Get focus history
// @access  Private
router.get('/focus', auth, async (req, res) => {
    try {
        const logs = await FocusLog.findAll({
            where: { userId: req.user.id },
            order: [['completedAt', 'DESC']],
            limit: 50
        });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/history/health
// @desc    Get health calc history (Ideal Body Calc related)
// @access  Private
router.get('/health', auth, async (req, res) => {
    try {
        const entries = await HealthEntry.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']],
            limit: 50
        });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/history/habits
// @desc    Get completed habits history
// @access  Private
router.get('/habits', auth, async (req, res) => {
    try {
        const logs = await HabitLog.findAll({
            include: [{
                model: Habit,
                where: { userId: req.user.id }
            }],
            order: [['date', 'DESC']],
            limit: 50
        });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/history/focus
// @desc    Log focus session
// @access  Private
router.post('/focus', auth, async (req, res) => {
    const { duration } = req.body; // duration in minutes
    try {
        const newLog = await FocusLog.create({
            duration,
            completedAt: new Date(),
            userId: req.user.id
        });
        res.json(newLog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
