const prisma = require('../config/db');
const { toNumber, parseActionableSteps } = require('../utils/dbHelpers');

/**
 * Calculates the Customer Value Score (0-100) using dynamic weights from the database.
 */
exports.calculateValueScore = async (customerData) => {
    try {
        const valRules = await prisma.valueScoringRule.findFirst({
            orderBy: { updated_at: 'desc' },
        });

        if (!valRules) {
            console.error('❌ Rules Engine Error: No value scoring rules found in DB.');
            throw new Error('No value scoring rules found in the database.');
        }

        let valueScore = 0;

        const balanceNorm = toNumber(valRules.balance_normalization_factor, 100000);
        const salaryNorm = toNumber(valRules.salary_normalization_factor, 100000);

        let balancePoints =
            (toNumber(customerData.Balance) / balanceNorm) * valRules.balance_max_points;
        valueScore += Math.min(balancePoints, valRules.balance_max_points);

        let salaryPoints =
            (toNumber(customerData.EstimatedSalary) / salaryNorm) * valRules.salary_max_points;
        valueScore += Math.min(salaryPoints, valRules.salary_max_points);

        if (customerData.IsActiveMember === 1) {
            valueScore += valRules.active_member_bonus;
        }

        if (customerData['Card Type'] && customerData['Card Type'].toUpperCase() === 'DIAMOND') {
            valueScore += valRules.diamond_card_bonus;
        }

        return Math.max(0, Math.min(100, Math.round(valueScore)));
    } catch (error) {
        console.error('❌ Failed to calculate Value Score:', error.message);
        throw error;
    }
};

/**
 * Maps the AI Risk Score and the Value Score against the 2x2 matrix.
 */
exports.determineRetentionPlan = async (riskScore, valueScore) => {
    try {
        const allocationRules = await prisma.allocationRule.findMany({
            include: {
                plan: {
                    select: {
                        name: true,
                        bank_investment: true,
                        actionable_steps: true,
                    },
                },
            },
        });

        let assignedPlan = null;

        for (const rule of allocationRules) {
            const minRisk = toNumber(rule.min_risk_score);
            const maxRisk = toNumber(rule.max_risk_score);

            if (
                riskScore >= minRisk &&
                riskScore <= maxRisk &&
                valueScore >= rule.min_value_score &&
                valueScore <= rule.max_value_score
            ) {
                assignedPlan = {
                    plan_id: rule.plan_id,
                    min_risk_score: minRisk,
                    max_risk_score: maxRisk,
                    min_value_score: rule.min_value_score,
                    max_value_score: rule.max_value_score,
                    name: rule.plan.name,
                    bank_investment: rule.plan.bank_investment,
                    actionable_steps: rule.plan.actionable_steps,
                    actionable_steps_parsed: parseActionableSteps(rule.plan.actionable_steps),
                };
                break;
            }
        }

        if (!assignedPlan) {
            console.warn(`⚠️ No retention plan rule matched for Risk: ${riskScore}, Value: ${valueScore}`);
        }

        return assignedPlan;
    } catch (error) {
        console.error('❌ Database query failed in determineRetentionPlan:', error.message);
        throw error;
    }
};
