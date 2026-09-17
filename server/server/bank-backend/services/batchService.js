const prisma = require('../config/db');
const aiService = require('./aiService');
const rulesEngine = require('./rulesEngine');
const {
    toNumber,
    computeBalance,
    computeEstimatedSalary,
} = require('../utils/dbHelpers');

exports.runManualBatchAssessment = async (bankId) => {
    console.log(`🔄 Starting Batch Assessment for Bank ID: ${bankId}...`);

    try {
        const profiles = await prisma.customerProfile.findMany({
            where: { is_active_member: 1, bank_id: bankId },
            include: {
                card_type: true,
                loyalty: true,
                transactions: {
                    select: { amount: true, transaction_type: true, category: true },
                },
                enrollments: {
                    where: { status: 'ACTIVE' },
                    select: { id: true },
                },
            },
        });

        console.log(`📊 Extracted ${profiles.length} active customers.`);

        const insertValues = [];

        for (const profile of profiles) {
            try {
                const customer = {
                    internal_db_id: profile.id,
                    CreditScore: profile.credit_score,
                    Geography: profile.geography,
                    Gender: profile.gender,
                    Age: profile.age,
                    Tenure: profile.tenure_years,
                    Balance: computeBalance(profile.transactions),
                    NumOfProducts: profile.enrollments.length,
                    IsActiveMember: profile.is_active_member,
                    HasCrCard: profile.has_cr_card,
                    EstimatedSalary: computeEstimatedSalary(profile.transactions),
                    'Satisfaction Score': profile.loyalty?.satisfaction_score ?? 3,
                    'Card Type': profile.card_type?.card_name ?? 'STANDARD',
                    'Point Earned': profile.loyalty?.points_earned ?? 0,
                };

                const riskScore = await aiService.getRiskPrediction(customer);
                const valueScore = await rulesEngine.calculateValueScore(customer);
                const assignedPlan = await rulesEngine.determineRetentionPlan(riskScore, valueScore);
                const planId = assignedPlan?.plan_id || 1;

                insertValues.push({
                    customer_id: profile.id,
                    ai_risk_score: toNumber(riskScore),
                    value_score: parseInt(valueScore, 10),
                    advised_plan_id: parseInt(planId, 10),
                });
            } catch (err) {
                console.error(`❌ FAILED Customer ${profile.id}: ${err.message}`);
            }
        }

        if (insertValues.length > 0) {
            const result = await prisma.churnAssessment.createMany({ data: insertValues });
            console.log(`✅ SUCCESS: ${result.count} rows saved to database.`);
            return {
                total_processed: profiles.length,
                successful: result.count,
                total: profiles.length,
                saved: result.count,
            };
        }

        console.error('❌ ERROR: No records were processed. insertValues is empty.');
        return {
            total_processed: profiles.length,
            successful: 0,
            total: profiles.length,
            saved: 0,
        };
    } catch (error) {
        console.error('🚨 CRITICAL ERROR IN BATCH PROCESSOR:', error);
        throw error;
    }
};
