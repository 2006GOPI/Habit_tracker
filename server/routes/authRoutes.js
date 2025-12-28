const express = require('express');
console.log("--> AUTH ROUTES FILE LOADED - ENV RELOADED <--");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/authMiddleware');

const fs = require('fs');

// ... imports

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
const sendEmail = require('../utils/emailService');

// @route   POST api/auth/register
// @desc    Register user with OTP
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, dob, gender } = req.body;

    try {
        if (!email || !password || !username) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Calculate Age
        let age = null;
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // Send Email
        try {
            await sendEmail(email, 'Your Verification Code', `Your OTP is: ${otp}`);
        } catch (emailErr) {
            console.error('Email send failed:', emailErr);
            return res.status(500).json({ msg: 'Failed to send verification email. Please check email address.' });
        }

        // Create user with isVerified: false
        user = await User.create({
            username,
            email,
            password: hashedPassword,
            gender,
            dob,
            age,
            otp,
            otpExpires,
            isVerified: false
        });

        res.json({ msg: 'Verification email sent', email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP and return token
// @access  Public
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid request' });
        }

        if (user.isVerified) {
            return res.status(400).json({ msg: 'User already verified' });
        }

        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // Verify User
        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, email: user.email, theme: user.theme } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, email: user.email, theme: user.theme } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        // Birthday Check
        if (user && user.dob) {
            const today = new Date();
            const birthDate = new Date(user.dob);

            // Check if Month and Day match
            if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
                // It is the birthday!
                // Ideally, check DB to see if we already sent an email this year.
                // For now, we will just log it or fire-and-forget (careful of spam on reload)
                // Let's rely on Client-side for the "Message" and keep email for a more robust implementation later
                // OR: Just send it.
                // await sendEmail(user.email, 'Happy Birthday!', 'Happy Birthday from Routine Rocket! Have a healthy year ahead!');
            }
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { age, gender, username, theme } = req.body;
    try {
        const user = await User.findByPk(req.user.id);
        if (age) user.age = age;
        if (gender) user.gender = gender;
        if (username) user.username = username;
        if (username) user.username = username;
        if (theme) user.theme = theme;
        if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Current Password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/birthday-wish', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        await sendEmail(
            user.email,
            `🎂 Happy Birthday, ${user.username}! 🎶`,
            `🎵 Happy Birthday to you!\nHappy Birthday to you!\nHappy Birthday to ${user.username}!\nHappy Birthday to you! 🎵\n\n\nWishing you a fantastic day filled with joy, laughter, and checked-off habits!\n\nBest Wishes,\nThe Routine Rocket Team 🚀`
        );

        res.json({ msg: 'Wish sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
