const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerUser);

module.exports = router;
// This file defines the authentication routes for user login and registration.
// It uses the authController to handle the logic for these routes.