const express = require('express');
const router = express.Router();
const { Habit, HabitLog } = require('../models');
const auth = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// @route   POST api/habits
// @desc    Create a habit
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, category, description } = req.body;
    try {
        const newHabit = await Habit.create({
            name,
            category,
            description,
            userId: req.user.id
        });
        res.json(newHabit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/habits
// @desc    Get all habits for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.findAll({
            where: { userId: req.user.id },
            include: [{ model: HabitLog }]
        });
        res.json(habits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/habits/:id
// @desc    Update habit
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, category, description } = req.body;
    try {
        let habit = await Habit.findByPk(req.params.id);
        if (!habit) return res.status(404).json({ msg: 'Habit not found' });
        if (habit.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        habit.name = name || habit.name;
        habit.category = category || habit.category;
        habit.description = description || habit.description;

        await habit.save();
        res.json(habit);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/habits/:id
// @desc    Delete habit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let habit = await Habit.findByPk(req.params.id);
        if (!habit) return res.status(404).json({ msg: 'Habit not found' });
        if (habit.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await habit.destroy();
        res.json({ msg: 'Habit removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/habits/log
// @desc    Log a habit completion
// @access  Private
router.post('/log', auth, async (req, res) => {
    const { habitId, date, status } = req.body;
    try {
        // Check if log exists for date
        let log = await HabitLog.findOne({
            where: {
                habitId,
                date: date || new Date()
            }
        });

        if (log) {
            log.status = status;
            await log.save();
            return res.json(log);
        }

        const newLog = await HabitLog.create({
            habitId,
            date: date || new Date(),
            status
        });
        res.json(newLog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
