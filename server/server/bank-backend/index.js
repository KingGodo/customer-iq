// 1. Load environment variables from the .env file immediately
require('dotenv').config();

// =========================================
// 🚨 EMERGENCY DEBUGGING TRAPS 🚨
// These will catch any silent errors happening in your other files
// =========================================
process.on('uncaughtException', (err) => {
    console.error('\n🚨 FATAL UNCAUGHT EXCEPTION 🚨');
    console.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n🚨 FATAL UNHANDLED REJECTION 🚨');
    console.error(reason);
});
// =========================================

const express = require('express');
const cors = require('cors');

// 2. Import your Routes
const customerRoutes = require('./routes/customerRoutes');
const apiRoutes = require('./routes/apiRoutes'); // Import the new API routes
const grouter = require('./routes/gatewayRoutes'); // Import the API Gateway routes
const ingestRoutes = require('./routes/bulkIngest'); // Import the bulk ingest routes
// 3. Initialize the Express application
const app = express();

// 4. Apply Middleware
// CORS allows your React/Next.js frontend to talk to this backend without browser security blocks
app.use(cors()); 
// This allows Express to read the JSON payloads sent in HTTP POST requests
app.use(express.json());
app.use('/api/bulk', ingestRoutes);
// 5. Mount the Routes
// Any request starting with '/api' will be handed off to the customerRoutes file
app.use('/api', customerRoutes);
app.use('/api', apiRoutes); // Mount the new API routes under the same '/api' prefix
app.use('/api/BankIntegration', grouter); // Mount the API Gateway routes under '/api/v1' prefix
 // Mount the bulk ingest routes under '/api/bulk' prefix
// 6. Basic Health Check Endpoint
// Useful for quickly verifying the server is running in the browser
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Bank Retention Rules Engine is live.',
        database: 'postgresql+prisma',
        ai_connected_url: process.env.AI_ENGINE_URL || 'Not configured'
    });
});

// 7. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Node.js Backend Engine running on Port ${PORT}`);
    console.log(`🔗 Local Testing URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
});