const prisma = require('../config/db');
const {
    toNumber,
    computeBalance,
    computeEstimatedSalary,
    formatTimeLabel,
} = require('../utils/dbHelpers');

// 1. DASHBOARD OVERVIEW
exports.getOverview = async (req, res) => {
    const bankId = req.user.bank_id;
    try {
        const customers = await prisma.customerProfile.findMany({
            where: { bank_id: bankId, is_active_member: 1 },
            include: {
                assessments: {
                    orderBy: { id: 'desc' },
                    take: 1,
                    select: { ai_risk_score: true },
                },
            },
        });

        const total_customers = customers.length;
        let high_risk_customers = 0;
        let riskSum = 0;
        let riskCount = 0;

        for (const c of customers) {
            const score = c.assessments[0]?.ai_risk_score;
            if (score === undefined || score === null) continue;
            riskSum += score;
            riskCount += 1;
            if (score > 0.7) high_risk_customers += 1;
        }

        res.status(200).json({
            status: 'success',
            data: {
                total_customers,
                high_risk_customers,
                avg_bank_risk: riskCount ? riskSum / riskCount : null,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. CUSTOMER PROFILE
exports.getCustomerProfile = async (req, res) => {
    const bankId = req.user.bank_id;
    const customerId = Number(req.params.id);

    try {
        const profile = await prisma.customerProfile.findFirst({
            where: { id: customerId, bank_id: bankId },
            include: {
                card_type: true,
                loyalty: true,
                assessments: {
                    orderBy: { id: 'desc' },
                    take: 1,
                    include: { advised_plan: true },
                },
                transactions: {
                    orderBy: { transaction_date: 'desc' },
                    take: 10,
                    select: {
                        transaction_date: true,
                        amount: true,
                        transaction_type: true,
                        category: true,
                        description: true,
                    },
                },
            },
        });

        if (!profile) return res.status(404).json({ error: 'Access denied.' });

        const allTx = await prisma.customerTransaction.findMany({
            where: { customer_id: customerId },
            select: { amount: true, transaction_type: true },
        });

        const latest = profile.assessments[0];
        const profilePayload = {
            ...profile,
            card_name: profile.card_type?.card_name ?? null,
            points_earned: profile.loyalty?.points_earned ?? null,
            satisfaction_score: profile.loyalty?.satisfaction_score ?? null,
            ai_risk_score: latest?.ai_risk_score ?? null,
            value_score: latest?.value_score ?? null,
            plan_name: latest?.advised_plan?.name ?? null,
            balance: computeBalance(allTx),
            card_type: undefined,
            loyalty: undefined,
            assessments: undefined,
            transactions: undefined,
        };

        const history = await prisma.churnAssessment.findMany({
            where: { customer_id: customerId },
            orderBy: { assessment_date: 'desc' },
            include: { advised_plan: { select: { name: true } } },
        });

        res.status(200).json({
            status: 'success',
            data: {
                profile: profilePayload,
                transactions: profile.transactions.map((t) => ({
                    ...t,
                    amount: toNumber(t.amount),
                })),
                history: history.map((h) => ({
                    assessment_date: h.assessment_date,
                    ai_risk_score: h.ai_risk_score,
                    value_score: h.value_score,
                    plan_name: h.advised_plan?.name ?? null,
                })),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. RETENTION PLAN POPULARITY
exports.getRetentionPopularity = async (req, res) => {
    const bankId = req.user.bank_id;
    try {
        const assessments = await prisma.churnAssessment.findMany({
            where: { customer: { bank_id: bankId } },
            include: { advised_plan: { select: { name: true } } },
        });

        const counts = {};
        for (const a of assessments) {
            const name = a.advised_plan?.name;
            if (!name) continue;
            counts[name] = (counts[name] || 0) + 1;
        }

        const results = Object.entries(counts)
            .map(([name, assigned_count]) => ({ name, assigned_count }))
            .sort((a, b) => b.assigned_count - a.assigned_count);

        res.status(200).json({ status: 'success', data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. GET CUSTOMERS LIST
exports.getCustomersList = async (req, res) => {
    const bankId = req.user.bank_id;
    try {
        const customers = await prisma.customerProfile.findMany({
            where: { bank_id: bankId },
            include: {
                transactions: {
                    select: { amount: true, transaction_type: true, category: true },
                },
                assessments: {
                    orderBy: { id: 'desc' },
                    take: 1,
                    include: { advised_plan: { select: { name: true } } },
                },
            },
        });

        const data = customers
            .map((p) => {
                const latest = p.assessments[0];
                return {
                    id: p.id,
                    customer_uid: p.customer_uid,
                    first_name: p.first_name,
                    last_name: p.last_name,
                    balance: computeBalance(p.transactions),
                    estimated_salary: computeEstimatedSalary(p.transactions),
                    ai_risk_score: latest?.ai_risk_score ?? null,
                    value_score: latest?.value_score ?? null,
                    plan_name: latest?.advised_plan?.name ?? null,
                };
            })
            .sort((a, b) => (b.ai_risk_score ?? -1) - (a.ai_risk_score ?? -1));

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. VALUE SCORING RULES
exports.getValueRules = async (req, res) => {
    try {
        const rules = await prisma.valueScoringRule.findFirst({
            orderBy: { updated_at: 'desc' },
        });
        res.status(200).json({
            status: 'success',
            data: rules
                ? {
                      ...rules,
                      balance_normalization_factor: toNumber(rules.balance_normalization_factor),
                      salary_normalization_factor: toNumber(rules.salary_normalization_factor),
                  }
                : null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateValueRules = async (req, res) => {
    const { balance_max_points, salary_max_points, active_member_bonus } = req.body;
    try {
        const existing = await prisma.valueScoringRule.findFirst({ orderBy: { id: 'asc' } });
        if (!existing) {
            return res.status(404).json({ error: 'No value scoring rules found.' });
        }

        await prisma.valueScoringRule.update({
            where: { id: existing.id },
            data: {
                balance_max_points: Number(balance_max_points),
                salary_max_points: Number(salary_max_points),
                active_member_bonus: Number(active_member_bonus),
            },
        });
        res.status(200).json({ status: 'success', message: 'Rules updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. BATCH PROCESSING HISTORY
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
            const key = a.assessment_date.toISOString();
            if (!groups.has(key)) {
                groups.set(key, {
                    run_timestamp: a.assessment_date,
                    customers_processed: 0,
                    riskSum: 0,
                    primary_strategy: a.advised_plan?.name ?? null,
                });
            }
            const g = groups.get(key);
            g.customers_processed += 1;
            g.riskSum += a.ai_risk_score;
        }

        const history = Array.from(groups.values()).map((g) => ({
            run_timestamp: g.run_timestamp,
            customers_processed: g.customers_processed,
            avg_risk_detected: g.customers_processed ? g.riskSum / g.customers_processed : 0,
            primary_strategy: g.primary_strategy,
        }));

        res.status(200).json({ status: 'success', data: history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. NEW BATCH TRIGGER (PROTOTYPE MODE - All Banks)
exports.triggerBatchAssessment = async (req, res) => {
    const startTime = Date.now();

    try {
        console.log('🌍 PROTOTYPE MODE: Initiating Global Batch Assessment for ALL Banks...');

        const banks = await prisma.bank.findMany({ select: { id: true, bank_name: true } });

        if (banks.length === 0) {
            return res.status(400).json({ error: 'No banks found in the database to process.' });
        }

        let totalScannedGlobal = 0;
        let totalDetectedGlobal = 0;

        for (const bank of banks) {
            const totalScanned = Math.floor(Math.random() * 500) + 1000;
            const highRisk = Math.floor(totalScanned * (Math.random() * 0.15 + 0.05));
            const avgConfidence = Number((Math.random() * 0.2 + 0.75).toFixed(4));
            const executionTime = Math.floor(Math.random() * 200) + 50;

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
        }

        const totalExecutionTime = Date.now() - startTime;

        res.status(200).json({
            status: 'success',
            message: `Global batch assessment completed in ${totalExecutionTime}ms.`,
            data: {
                banks_processed: banks.length,
                scanned: totalScannedGlobal,
                detected: totalDetectedGlobal,
            },
        });
    } catch (error) {
        console.error('🚨 Global Batch Trigger Error:', error.message);
        res.status(500).json({ status: 'error', message: 'Global batch processing failed.' });
    }
};

// 8. NEW AI ANALYTICS FETCHER
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

// 9. RETENTION RULES ENGINE
exports.getRetentionSettings = async (req, res) => {
    try {
        const plans = await prisma.retentionPlan.findMany({
            include: { allocation_rules: true },
        });

        const settings = plans.flatMap((rp) => {
            if (!rp.allocation_rules.length) {
                return [{
                    plan_id: rp.id,
                    name: rp.name,
                    bank_investment: rp.bank_investment,
                    actionable_steps: rp.actionable_steps,
                    rule_id: null,
                    min_risk_score: null,
                    max_risk_score: null,
                    min_value_score: null,
                    max_value_score: null,
                }];
            }
            return rp.allocation_rules.map((ar) => ({
                plan_id: rp.id,
                name: rp.name,
                bank_investment: rp.bank_investment,
                actionable_steps: rp.actionable_steps,
                rule_id: ar.id,
                min_risk_score: toNumber(ar.min_risk_score),
                max_risk_score: toNumber(ar.max_risk_score),
                min_value_score: ar.min_value_score,
                max_value_score: ar.max_value_score,
            }));
        });

        res.status(200).json({ status: 'success', data: settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRetentionPlan = async (req, res) => {
    const { name, bank_investment, min_risk, max_risk, min_value, max_value } = req.body;
    try {
        const plan = await prisma.$transaction(async (tx) => {
            const created = await tx.retentionPlan.create({
                data: {
                    name,
                    bank_investment,
                    actionable_steps: ['New plan initialized.'],
                },
            });

            await tx.allocationRule.create({
                data: {
                    plan_id: created.id,
                    min_risk_score: Number(min_risk),
                    max_risk_score: Number(max_risk),
                    min_value_score: Number(min_value),
                    max_value_score: Number(max_value),
                },
            });

            return created;
        });

        res.status(201).json({
            status: 'success',
            message: 'New retention plan created.',
            plan_id: plan.id,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRetentionRule = async (req, res) => {
    const { plan_id, name, bank_investment, min_risk, max_risk, min_value, max_value } = req.body;
    try {
        await prisma.$transaction([
            prisma.retentionPlan.update({
                where: { id: Number(plan_id) },
                data: { name, bank_investment },
            }),
            prisma.allocationRule.updateMany({
                where: { plan_id: Number(plan_id) },
                data: {
                    min_risk_score: Number(min_risk),
                    max_risk_score: Number(max_risk),
                    min_value_score: Number(min_value),
                    max_value_score: Number(max_value),
                },
            }),
        ]);
        res.status(200).json({ status: 'success', message: 'Retention strategy updated.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. API KEY
exports.getApiKey = async (req, res) => {
    try {
        const bankId = req.user.bank_id;
        const bank = await prisma.bank.findUnique({
            where: { id: bankId },
            select: { api_access_key: true },
        });
        if (!bank) return res.status(404).json({ error: 'Bank not found.' });
        res.status(200).json({ status: 'success', key: bank.api_access_key });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 11. CSV UPLOAD HANDLER
exports.processCSVImport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No CSV file was uploaded.' });
        res.status(200).json({
            status: 'success',
            message: 'CSV received.',
            fileName: req.file.originalname,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process CSV file.' });
    }
};
