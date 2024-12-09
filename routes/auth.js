const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const dotenv = require('dotenv');


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});




router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create JWT token for password reset with an expiration time of 10 minutes for testing
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET + user.password,
            { expiresIn: '10m' } // Adjusted expiry time for testing
        );

        // Construct the password reset link
        const resetLink = `http://localhost:3000/reset-password/${user._id}/${token}`;

        // Mocking sendEmail for testing
        // If you're testing in Postman, you can use a mock function like below, or use a service like Mailtrap.
        await sendEmail(
            email,
            "Password Reset Link",
            resetLink,
            `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`
        );
        console.log(resetLink);
        res.json({ message: "Password reset link sent to email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;


router.post('/reset-password/:id/:token', async (req, res) => {
    try {
        const { id, token } = req.params;
        const { password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const secret = process.env.JWT_SECRET + user.password;
        jwt.verify(token, secret);

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;