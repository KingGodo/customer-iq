/**
 * Shared helpers for Prisma Decimal / transaction aggregates.
 */

function toNumber(value, fallback = 0) {
    if (value === null || value === undefined) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function computeBalance(transactions = []) {
    return transactions.reduce((sum, t) => {
        const amount = toNumber(t.amount);
        return sum + (t.transaction_type === 'CREDIT' ? amount : -amount);
    }, 0);
}

function computeEstimatedSalary(transactions = []) {
    const salaries = transactions.filter(
        (t) => t.category === 'SALARY' && t.transaction_type === 'CREDIT'
    );
    if (salaries.length === 0) return 0;
    const total = salaries.reduce((sum, t) => sum + toNumber(t.amount), 0);
    return total / salaries.length;
}

function parseActionableSteps(steps) {
    if (Array.isArray(steps)) return steps;
    if (typeof steps === 'string') {
        try {
            return JSON.parse(steps);
        } catch {
            return [steps];
        }
    }
    return [];
}

function formatTimeLabel(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

module.exports = {
    toNumber,
    computeBalance,
    computeEstimatedSalary,
    parseActionableSteps,
    formatTimeLabel,
};
