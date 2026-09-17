const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/predict';

exports.getRiskPrediction = async (customerData) => {
    try {
        const response = await axios.post(AI_ENGINE_URL, customerData, {
            timeout: 5000, 
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.status === 'success') {
            return response.data.data.churn_probability; 
        } else {
            throw new Error('AI Engine returned an unexpected response format.');
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('CRITICAL: Cannot connect to Python AI Engine. Is Uvicorn running?');
        } else if (error.code === 'ECONNABORTED') {
            console.error(`CRITICAL: AI Engine request timed out for customer ${customerData.internal_db_id}`);
        } else {
            console.error('Error communicating with AI service:', error.message);
        }
        throw new Error('Failed to retrieve risk prediction from the AI microservice.');
    }
};