const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
router.post('/onboard/register-bank', authController.registerNewBank);
// Existing route for single customer testing
router.post('/analyze-customer', customerController.analyzeCustomer);
// router.use(authMiddleware);
// NEW ROUTE: Triggers the mass extraction and AI processing
router.post('/trigger-batch', customerController.triggerBatchAssessment);
router.get('/dashboard/batch-analytics', customerController.getAIAnalytics);
module.exports = router;