const express = require('express');
const grouter = express.Router();
const apiGateway = require('../middleware/apiGateway');
const integrationController = require('../controllers/integrationController');

/** * GATEWAY PROTECTED EXTERNAL API v1
 * All routes here are accessed by: http://localhost:5000/api/v1/sync/...
 * Required Header: x-api-key: [Your-Bank-Access-Key]
 */
grouter.use(apiGateway); // Secure all integration endpoints

// Customer Identity Sync
grouter.post('/sync/customers', integrationController.syncCustomers);

// Financial Data Sync
grouter.post('/sync/transactions', integrationController.syncTransactions);

// Product Usage Sync
grouter.post('/sync/products', integrationController.syncProducts);

// Loyalty & Engagement Sync
grouter.post('/sync/loyalty', integrationController.syncLoyalty);

module.exports = grouter;