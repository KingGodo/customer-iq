const prisma = require('../config/db');

// 1. Sync Customer Profiles
exports.syncCustomers = async (req, res) => {
    const bankId = req.bank.id;
    const { customers } = req.body;
    try {
        await prisma.$transaction(
            customers.map((c) =>
                prisma.customerProfile.upsert({
                    where: {
                        bank_id_customer_uid: {
                            bank_id: bankId,
                            customer_uid: c.uid,
                        },
                    },
                    create: {
                        bank_id: bankId,
                        customer_uid: c.uid,
                        first_name: c.fName,
                        last_name: c.lName,
                        gender: c.gender,
                        age: c.age,
                        geography: c.geo,
                        credit_score: c.score,
                        tenure_years: c.tenure,
                        is_active_member: c.active ? 1 : 0,
                        has_cr_card: c.hasCard ? 1 : 0,
                        joined_date: c.joined ? new Date(c.joined) : new Date(),
                    },
                    update: {
                        credit_score: c.score,
                        is_active_member: c.active ? 1 : 0,
                    },
                })
            )
        );
        res.status(200).json({ status: 'success', message: `Synced ${customers.length} customers.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Sync Transactions
exports.syncTransactions = async (req, res) => {
    try {
        const { transactions } = req.body;
        await prisma.customerTransaction.createMany({
            data: transactions.map((t) => ({
                customer_id: t.customerId,
                amount: t.amount,
                transaction_type: t.type,
                category: t.category,
                description: t.desc,
            })),
        });
        res.status(200).json({ status: 'success', message: 'Transactions logged.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Sync Product Enrollments
exports.syncProducts = async (req, res) => {
    try {
        const { enrollments } = req.body;
        await prisma.customerProductEnrollment.createMany({
            data: enrollments.map((e) => ({
                customer_id: e.customerId,
                product_id: e.productId,
                enrolled_date: e.date ? new Date(e.date) : new Date(),
                status: e.status || 'ACTIVE',
            })),
        });
        res.status(200).json({ status: 'success', message: 'Products synced.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Sync Loyalty Data
exports.syncLoyalty = async (req, res) => {
    try {
        const { loyaltyData } = req.body;
        await prisma.$transaction(
            loyaltyData.map((l) =>
                prisma.customerLoyalty.upsert({
                    where: { customer_id: l.customerId },
                    create: {
                        customer_id: l.customerId,
                        points_earned: l.points,
                        satisfaction_score: l.score,
                    },
                    update: {
                        points_earned: l.points,
                        satisfaction_score: l.score,
                    },
                })
            )
        );
        res.status(200).json({ status: 'success', message: 'Loyalty updated.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
