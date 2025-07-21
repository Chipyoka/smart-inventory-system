const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { findUserByUsername } = require('../models/userModel');

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await findUserByUsername(username);

    if (!user || user.role !== role) {
      return res.status(400).json({ message: 'Invalid username or role' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
