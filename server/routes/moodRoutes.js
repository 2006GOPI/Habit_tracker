const express = require('express');
const router = express.Router();
const { Mood } = require('../models');
const auth = require('../middleware/authMiddleware');

// @route   POST api/moods
// @desc    Log mood
// @access  Private
router.post('/', auth, async (req, res) => {
    const { mood_score, note, date } = req.body;
    try {
        const newMood = await Mood.create({
            mood_score,
            note,
            date: date || new Date(),
            userId: req.user.id
        });
        res.json(newMood);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/moods
// @desc    Get mood history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const moods = await Mood.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(moods);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
