const express = require('express');
const router = express.Router();
const { HealthEntry } = require('../models');
const auth = require('../middleware/authMiddleware');

// @route   POST api/health
// @desc    Log health entry
// @access  Private
router.post('/', auth, async (req, res) => {
    const { weight, bp_systolic, bp_diastolic, date, bmi, status } = req.body;
    try {
        const newEntry = await HealthEntry.create({
            weight,
            bp_systolic,
            bp_diastolic,
            bmi,
            status,
            date: date || new Date(),
            userId: req.user.id
        });
        res.json(newEntry);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/health
// @desc    Get health history
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const entries = await HealthEntry.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
