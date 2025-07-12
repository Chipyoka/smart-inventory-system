const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getInventory, addItem } = require('../controllers/inventoryController');

router.get('/', passport.authenticate('jwt', { session: false }), getInventory);
router.get('/test-get', getInventory);
router.post('/', passport.authenticate('jwt', { session: false }), addItem);

module.exports = router;
// This file defines the inventory routes for getting and adding items.
// It uses Passport.js for JWT authentication to secure these routes.