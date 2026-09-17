const prisma = require('../config/db');
const rulesEngine = require('../services/rulesEngine');
const aiService = require('../services/aiService');
const { runManualBatchAssessment } = require('../services/batchService');
const { formatTimeLabel } = require('../utils/dbHelpers');
const { parseActionableSteps } = require('../utils/dbHelpers');

// --------------------------------------------------------
// EXISTING: Single Customer Analysis
// --------------------------------------------------------
exports.analyzeCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        if (!customerData || Object.keys(customerData).length === 0) {
            return res.status(400).json({ error: 'No customer data provided' });
        }

        const valueScore = await rulesEngine.calculateValueScore(customerData);
        const riskScore = await aiService.getRiskPrediction(customerData);
        const assignedPlan = await rulesEngine.determineRetentionPlan(riskScore, valueScore);

        res.status(200).json({
            status: 'success',
            customer_metrics: {
                ai_risk_score: parseFloat(riskScore.toFixed(4)),
                calculated_value_score: Math.round(valueScore),
            },
            recommended_strategy: {
                plan_name: assignedPlan ? assignedPlan.name : 'Standard Monitoring',
                bank_investment: assignedPlan ? assignedPlan.bank_investment : '$0',
                actions: assignedPlan
                    ? parseActionableSteps(assignedPlan.actionable_steps)
                    : ['Monitor account passively'],
            },
        });
    } catch (error) {
        console.error('Error in analyzeCustomer controller:', error.message);
        res.status(500).json({
            status: 'error',
            message: error.message || 'System processing failed. Check the server logs.',
        });
    }
};

exports.triggerBatchAssessment = async (req, res) => {
    const startTime = Date.now();

    try {
        console.log('🌍 PROTOTYPE MODE: Initiating Global Batch Assessment for ALL Banks...');

        const banks = await prisma.bank.findMany({ select: { id: true, bank_name: true } });

        if (banks.length === 0) {
            return res.status(400).json({ error: 'No banks found.' });
        }

        let totalScannedGlobal = 0;
        let totalDetectedGlobal = 0;

        for (const bank of banks) {
            const assessmentResult = await runManualBatchAssessment(bank.id);

            const totalScanned = assessmentResult.total_processed;
            const highRisk = assessmentResult.successful;
            const avgConfidence = 0.95;
            const executionTime = Date.now() - startTime;

            totalScannedGlobal += totalScanned;
            totalDetectedGlobal += highRisk;

            await prisma.aiPerformanceLog.create({
                data: {
                    bank_id: bank.id,
                    total_customers_scanned: totalScanned,
                    high_risk_detected: highRisk,
                    avg_confidence_score: avgConfidence,
                    execution_time_ms: executionTime,
                },
            });

            console.log(`✅ Processed ${bank.bank_name} - Scanned: ${totalScanned} | Saved: ${highRisk}`);
        }

        res.status(200).json({
            status: 'success',
            message: 'Global batch assessment completed.',
            data: { scanned: totalScannedGlobal, detected: totalDetectedGlobal },
        });
    } catch (error) {
        console.error('🚨 Global Batch Trigger Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Global batch processing failed.' });
    }
};

exports.getAIAnalytics = async (req, res) => {
    const bankId = req.user.bank_id;
    try {
        const logs = await prisma.aiPerformanceLog.findMany({
            where: { bank_id: bankId },
            orderBy: { run_timestamp: 'asc' },
            take: 30,
        });

        const data = logs.map((log) => ({
            time_label: formatTimeLabel(log.run_timestamp),
            total_customers_scanned: log.total_customers_scanned,
            high_risk_detected: log.high_risk_detected,
            churn_rate_pct: log.total_customers_scanned
                ? (log.high_risk_detected / log.total_customers_scanned) * 100
                : 0,
            confidence_pct: log.avg_confidence_score * 100,
            execution_time_ms: log.execution_time_ms,
        }));

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBatchHistory = async (req, res) => {
    const bankId = req.user.bank_id;
    try {
        const assessments = await prisma.churnAssessment.findMany({
            where: { customer: { bank_id: bankId } },
            include: { advised_plan: { select: { name: true } } },
            orderBy: { assessment_date: 'desc' },
        });

        const groups = new Map();
        for (const a of assessments) {
            const runDate = a.assessment_date.toISOString().slice(0, 10);
            if (!groups.has(runDate)) {
                groups.set(runDate, {
                    run_date: runDate,
                    customers_processed: 0,
                    riskSum: 0,
                    primary_strategy: a.advised_plan?.name ?? null,
                });
            }
            const g = groups.get(runDate);
            g.customers_processed += 1;
            g.riskSum += a.ai_risk_score;
        }

        const history = Array.from(groups.values()).map((g) => ({
            run_date: g.run_date,
            customers_processed: g.customers_processed,
            avg_risk_detected: g.customers_processed ? g.riskSum / g.customers_processed : 0,
            primary_strategy: g.primary_strategy,
        }));

        res.status(200).json({ status: 'success', data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
