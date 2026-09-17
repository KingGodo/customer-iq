const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// ==========================================
// 1. CONTROLLERS & MIDDLEWARE IMPORTS
// ==========================================
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');
const integrationController = require('../controllers/integrationController');
const communicationController = require('../controllers/communicationController');

const authMiddleware = require('../middleware/authMiddleware');
const apiGateway = require('../middleware/apiGateway');

// ==========================================
// 2. MULTER CONFIGURATION (For CSV Uploads)
// ==========================================
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.csv') {
            return cb(new Error('Only CSV files are allowed'), false);
        }
        cb(null, true);
    }
});

// ==========================================
// 🔓 3. PUBLIC ROUTES (No Authentication)
// ==========================================
// Bank User Authentication
router.post('/auth/register', authController.registerBankUser);
router.post('/auth/login', authController.login);

// Initial Bank Infrastructure Deployment



// ==========================================
// 🌍 4. EXTERNAL INTEGRATION API (Server-to-Server)
// These routes use `apiGateway` (Requires x-api-key header)
// ==========================================
router.post('/v1/sync/customers', apiGateway, integrationController.syncCustomers);
router.post('/v1/sync/transactions', apiGateway, integrationController.syncTransactions);
router.post('/v1/sync/products', apiGateway, integrationController.syncProducts);
router.post('/v1/sync/loyalty', apiGateway, integrationController.syncLoyalty);


// ==========================================
// 🔒 5. INTERNAL DASHBOARD ROUTES (Manager Portal)
// The middleware intercepts EVERYTHING below this line (Requires JWT)
// ==========================================
router.use(authMiddleware); 

// --- Analytics & Profiles ---
router.get('/dashboard/overview', dashboardController.getOverview);
router.get('/dashboard/retention-popularity', dashboardController.getRetentionPopularity);
router.get('/dashboard/customers', dashboardController.getCustomersList);
router.get('/customers/:id', dashboardController.getCustomerProfile);

// --- System Rules Engine ---
router.get('/dashboard/value-rules', dashboardController.getValueRules);
router.put('/dashboard/value-rules', dashboardController.updateValueRules);

// --- Retention Strategy Manager ---
router.get('/dashboard/retention-settings', dashboardController.getRetentionSettings);
router.post('/dashboard/retention-settings', dashboardController.createRetentionPlan);
router.put('/dashboard/retention-settings', dashboardController.updateRetentionRule);

// --- Communications (SMS / Email retention pushes) ---
router.get('/dashboard/communications', communicationController.getOverview);
router.get('/dashboard/communications/preview', communicationController.previewAudience);
router.get('/dashboard/communications/:id', communicationController.getCampaign);
router.post('/dashboard/communications/send', communicationController.sendCampaign);

// --- AI Batch Processing ---
router.get('/dashboard/batch-history', dashboardController.getBatchHistory);
router.post('/trigger-batch', dashboardController.triggerBatchAssessment);

// --- API & Data Management ---
// Fetch the API key for the Developer Settings page
router.get('/settings/api-key', dashboardController.getApiKey);

// CSV Upload handler
router.post('/upload/csv', upload.single('customer_file'), dashboardController.processCSVImport);

module.exports = router;