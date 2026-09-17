const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 1. BANK REGISTRATION
exports.registerBankUser = async (req, res) => {
    try {
        const { bank_id, first_name, last_name, email, password, role } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.bankUser.create({
            data: {
                bank_id: Number(bank_id),
                first_name,
                last_name,
                email,
                password_hash: hashedPassword,
                role: role || 'MANAGER',
            },
        });

        res.status(201).json({ message: 'Bank user registered successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed.', details: error.message });
    }
};

// 2. LOGIN & TOKEN GENERATION
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.bankUser.findUnique({
            where: { email },
            include: { bank: { select: { bank_name: true } } },
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password.' });

        const token = jwt.sign(
            { id: user.id, bank_id: user.bank_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                bank_id: user.bank_id,
                bank_name: user.bank.bank_name,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.', details: error.message });
    }
};

exports.registerNewBank = async (req, res) => {
    const {
        bank_name, nationality, license_number, branch_code,
        admin_first_name, admin_last_name, admin_email, admin_password,
    } = req.body;

    try {
        const apiKey = `ciq_${crypto.randomBytes(24).toString('hex')}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin_password, salt);

        const result = await prisma.$transaction(async (tx) => {
            const bank = await tx.bank.create({
                data: {
                    bank_name,
                    nationality,
                    license_number,
                    branch_code,
                    api_access_key: apiKey,
                    status: 'ACTIVE',
                },
            });

            await tx.bankUser.create({
                data: {
                    bank_id: bank.id,
                    first_name: admin_first_name,
                    last_name: admin_last_name,
                    email: admin_email,
                    password_hash: hashedPassword,
                    role: 'ADMIN',
                },
            });

            return bank;
        });

        res.status(201).json({
            status: 'success',
            message: 'Bank Onboarded Successfully',
            credentials: {
                bank_id: result.id,
                api_access_key: apiKey,
                admin_user: admin_email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
