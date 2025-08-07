const express = require('express');
const router = express.Router();

const { generateInventoryReport } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware'); 

router.get('/inventory', verifyToken, checkRole('admin', 'manager'), generateInventoryReport);

module.exports = router;
