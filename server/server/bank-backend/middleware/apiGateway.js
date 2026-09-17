const prisma = require('../config/db');

const apiGateway = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API Key missing. Access denied.' });
    }

    try {
        const bank = await prisma.bank.findFirst({
            where: { api_access_key: apiKey, status: 'ACTIVE' },
            select: { id: true, bank_name: true },
        });

        if (!bank) {
            return res.status(401).json({ error: 'Invalid or suspended API Key.' });
        }

        req.bank = bank;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Gateway authentication error.' });
    }
};

module.exports = apiGateway;
