const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

const isPureSymbols = (val) => typeof val === 'string' && /^[^a-zA-Z0-9]+$/.test(val.trim());

// ==========================================
// STEP 1: REFERENCE & CONFIGURATION TABLES
// ==========================================

router.post('/ref-card-types', async (req, res) => {
    const { cards } = req.body;
    if (!Array.isArray(cards)) return res.status(400).json({ error: 'Payload must be a array of cards.' });

    try {
        const data = cards.map((c) => {
            if (isPureSymbols(c.card_name)) throw new Error(`Invalid card naming syntax: ${c.card_name}`);
            return { card_name: c.card_name, annual_fee: parseFloat(c.annual_fee) || 0 };
        });

        const result = await prisma.refCardType.createMany({ data });
        res.status(201).json({ message: `Successfully loaded ${result.count} card tier references.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /ref-card-types:', err);
        res.status(422).json({ error: 'Card type bulk insertion rejected.', details: err.message });
    }
});

router.post('/ref-bank-products', async (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Payload must be an array of products.' });

    try {
        const data = products.map((p) => {
            if (isPureSymbols(p.product_name)) throw new Error('Product configurations cannot be pure symbol masks.');
            return { product_name: p.product_name, category: p.category };
        });

        const result = await prisma.refBankProduct.createMany({ data });
        res.status(201).json({ message: `Configured ${result.count} institutional bank products.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /ref-bank-products:', err);
        res.status(422).json({ error: 'Product ingestion rejected.', details: err.message });
    }
});

router.post('/retention-plans', async (req, res) => {
    const { plans } = req.body;
    if (!Array.isArray(plans)) return res.status(400).json({ error: 'Payload must be an array of plans.' });

    try {
        const data = plans.map((p) => {
            let steps = p.actionable_steps || [];
            if (typeof steps === 'string') {
                try {
                    steps = JSON.parse(steps);
                } catch {
                    steps = [steps];
                }
            }
            return {
                name: p.name,
                bank_investment: p.bank_investment || '$0.00',
                actionable_steps: steps,
            };
        });

        const result = await prisma.retentionPlan.createMany({ data });
        res.status(201).json({ message: `Initialized ${result.count} system fallback retention matrices.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /retention-plans:', err);
        res.status(422).json({ error: 'Retention strategy loading failed.', details: err.message });
    }
});

router.post('/value-scoring-rules', async (req, res) => {
    const { rules } = req.body;
    if (!Array.isArray(rules)) return res.status(400).json({ error: 'Payload must be an array of rules.' });

    try {
        const data = rules.map((r) => ({
            balance_normalization_factor: parseFloat(r.balance_normalization_factor) || 100000,
            balance_max_points: parseInt(r.balance_max_points, 10) || 40,
            salary_normalization_factor: parseFloat(r.salary_normalization_factor) || 100000,
            salary_max_points: parseInt(r.salary_max_points, 10) || 30,
            active_member_bonus: parseInt(r.active_member_bonus, 10) || 15,
            diamond_card_bonus: parseInt(r.diamond_card_bonus, 10) || 15,
        }));

        const result = await prisma.valueScoringRule.createMany({ data });
        res.status(201).json({ message: `Successfully established ${result.count} neural scaling weight rules.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /value-scoring-rules:', err);
        res.status(422).json({ error: 'Scoring matrix setup rejected.', details: err.message });
    }
});

// ==========================================
// STEP 2: DEPENDENT LOGISTICS RULES
// ==========================================

router.post('/allocation-rules', async (req, res) => {
    const { rules } = req.body;
    if (!Array.isArray(rules)) return res.status(400).json({ error: 'Payload must be an array of allocation rules.' });

    try {
        const data = rules.map((r) => ({
            plan_id: parseInt(r.plan_id, 10),
            min_risk_score: parseFloat(r.min_risk_score),
            max_risk_score: parseFloat(r.max_risk_score),
            min_value_score: parseInt(r.min_value_score, 10),
            max_value_score: parseInt(r.max_value_score, 10),
        }));

        const result = await prisma.allocationRule.createMany({ data });
        res.status(201).json({ message: `Mapped ${result.count} cross-allocation tier routes successfully.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /allocation-rules:', err);
        res.status(422).json({
            error: 'Foreign Key validation failure. Confirm target Plan IDs exist.',
            details: err.message,
        });
    }
});

router.post('/bank-users', async (req, res) => {
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'Payload must be an array of administrative profiles.' });

    try {
        const data = users.map((u) => {
            if (isPureSymbols(u.first_name) || isPureSymbols(u.last_name)) {
                throw new Error('User names cannot be code handles or expressions.');
            }
            return {
                bank_id: parseInt(u.bank_id, 10),
                first_name: u.first_name,
                last_name: u.last_name,
                email: u.email,
                password_hash: u.password_hash || '$2b$10$dummyHash',
                role: u.role || 'MANAGER',
            };
        });

        const result = await prisma.bankUser.createMany({ data });
        res.status(201).json({ message: `Successfully provisioned ${result.count} administrator nodes.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /bank-users:', err);
        res.status(422).json({
            error: 'Identity generation failed. Check email keys or bank constraints.',
            details: err.message,
        });
    }
});

// ==========================================
// STEP 3: THE MAIN CUSTOMER HUB
// ==========================================

router.post('/customer-profiles', async (req, res) => {
    const { customers } = req.body;
    if (!Array.isArray(customers)) return res.status(400).json({ error: 'Payload must be an array of base profiles.' });

    try {
        const data = customers.map((c) => {
            if (isPureSymbols(c.customer_uid) || isPureSymbols(c.first_name)) {
                throw new Error(`Data format error found inside key identifier string: ${c.customer_uid}`);
            }
            return {
                bank_id: parseInt(c.bank_id, 10),
                customer_uid: c.customer_uid,
                first_name: c.first_name,
                last_name: c.last_name,
                gender: c.gender,
                age: parseInt(c.age, 10),
                geography: c.geography,
                credit_score: parseInt(c.credit_score, 10),
                tenure_years: parseInt(c.tenure_years, 10) || 0,
                is_active_member: c.is_active_member ? 1 : 0,
                has_cr_card: c.has_cr_card ? 1 : 0,
                card_type_id: parseInt(c.card_type_id, 10) || 1,
                joined_date: new Date(),
            };
        });

        const result = await prisma.customerProfile.createMany({ data });
        res.status(201).json({ message: `Successfully registered ${result.count} core user nodes in the database.` });
    } catch (err) {
        const visibleBanks = await prisma.bank.findMany({ select: { id: true, bank_name: true } });
        console.error('BANKS VISIBLE TO NODE.JS:', visibleBanks);
        console.error('🚨 CRITICAL DB ERROR IN /customer-profiles', err.message);
        res.status(422).json({
            error: 'Customer profile batch failed structural verification constraints.',
            details: err.message,
        });
    }
});

// ==========================================
// STEP 4: DEPENDENT TELEMETRY LOGS
// ==========================================

router.post('/customer-loyalty', async (req, res) => {
    const { loyaltyLogs } = req.body;
    if (!Array.isArray(loyaltyLogs)) return res.status(400).json({ error: 'Payload must be an array.' });

    try {
        const data = loyaltyLogs.map((l) => ({
            customer_id: parseInt(l.customer_id, 10),
            points_earned: parseInt(l.points_earned, 10) || 0,
            satisfaction_score: parseInt(l.satisfaction_score, 10) || 3,
        }));

        const result = await prisma.customerLoyalty.createMany({ data });
        res.status(201).json({ message: `Synchronized ${result.count} customer metrics cards.` });
    } catch (err) {
        console.error('🚨 DB ERROR IN /customer-loyalty:', err);
        res.status(422).json({ error: 'Data rejected. Check if target customer IDs exist.', details: err.message });
    }
});

router.post('/customer-transactions', async (req, res) => {
    const { transactions } = req.body;
    if (!Array.isArray(transactions)) return res.status(400).json({ error: 'Payload must be an array of transaction rows.' });

    try {
        const data = transactions.map((t) => ({
            customer_id: parseInt(t.customer_id, 10),
            amount: parseFloat(t.amount),
            transaction_type: t.transaction_type,
            category: t.category,
            description: t.description || 'Synced Transaction Log',
            transaction_date: new Date(),
        }));

        const result = await prisma.customerTransaction.createMany({ data });
        res.status(201).json({
            message: `Successfully appended ${result.count} operational records to customer ledgers.`,
        });
    } catch (err) {
        console.error('🚨 DB ERROR IN /customer-transactions:', err);
        res.status(422).json({
            error: 'Ledger syncing terminated. Verify customer profile relational mapping integrity.',
            details: err.message,
        });
    }
});

module.exports = router;
