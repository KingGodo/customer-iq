require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');

const DEMO_EMAIL = 'admin@demo.bank';
const DEMO_PASSWORD = 'Demo1234!';

async function seedBaseline() {
  const cardCount = await prisma.refCardType.count();
  if (cardCount === 0) {
    await prisma.refCardType.createMany({
      data: [
        { card_name: 'STANDARD', annual_fee: 0 },
        { card_name: 'SILVER', annual_fee: 50 },
        { card_name: 'GOLD', annual_fee: 100 },
        { card_name: 'PLATINUM', annual_fee: 200 },
        { card_name: 'DIAMOND', annual_fee: 400 },
      ],
    });
    console.log('✅ Seeded ref_card_types');
  }

  const productCount = await prisma.refBankProduct.count();
  if (productCount === 0) {
    await prisma.refBankProduct.createMany({
      data: [
        { product_name: 'Checking Account', category: 'DEPOSIT' },
        { product_name: 'Savings Account', category: 'DEPOSIT' },
        { product_name: 'Auto Loan', category: 'LOAN' },
        { product_name: 'Mortgage', category: 'LOAN' },
        { product_name: 'Credit Card', category: 'CARD' },
      ],
    });
    console.log('✅ Seeded ref_bank_products');
  }

  const rulesCount = await prisma.valueScoringRule.count();
  if (rulesCount === 0) {
    await prisma.valueScoringRule.create({
      data: {
        balance_normalization_factor: 100000,
        balance_max_points: 40,
        salary_normalization_factor: 100000,
        salary_max_points: 30,
        active_member_bonus: 15,
        diamond_card_bonus: 15,
      },
    });
    console.log('✅ Seeded value_scoring_rules');
  }

  const planCount = await prisma.retentionPlan.count();
  if (planCount === 0) {
    const plans = await Promise.all([
      prisma.retentionPlan.create({
        data: {
          name: 'Standard Monitoring',
          bank_investment: '$0.00',
          actionable_steps: ['Monitor account passively'],
          email_template:
            'Hi {{first_name}}, your CustomerIQ branch team is checking in. Reply if you need help with {{plan_name}}.',
          sms_template:
            'Hi {{first_name}}, CustomerIQ here. We are monitoring your account. Reply HELP for support.',
        },
      }),
      prisma.retentionPlan.create({
        data: {
          name: 'Soft Retention',
          bank_investment: '$50.00',
          actionable_steps: ['Send personalized offer', 'Schedule check-in call'],
          email_template:
            'Hi {{first_name}}, we value your relationship. Enjoy a limited fee waiver as part of {{plan_name}}. Talk soon.',
          sms_template:
            '{{first_name}}, CustomerIQ: fee waiver ready under Soft Retention. Visit your branch or reply YES.',
        },
      }),
      prisma.retentionPlan.create({
        data: {
          name: 'VIP Rescue',
          bank_investment: '$250.00',
          actionable_steps: ['Assign relationship manager', 'Offer fee waiver', 'Priority support'],
          email_template:
            '{{first_name}}, your dedicated manager prepared a VIP Rescue package. Priority support is unlocked today.',
          sms_template:
            '{{first_name}}: VIP Rescue active. Your RM will call today. Reply CALL to prioritize.',
        },
      }),
      prisma.retentionPlan.create({
        data: {
          name: 'High-Touch Save',
          bank_investment: '$500.00',
          actionable_steps: ['Executive outreach', 'Custom retention package'],
          email_template:
            '{{first_name}}, leadership approved a High-Touch Save package tailored to your account {{customer_uid}}.',
          sms_template:
            '{{first_name}}: High-Touch Save approved. Expect executive outreach within 24h.',
        },
      }),
    ]);

    await prisma.allocationRule.createMany({
      data: [
        { plan_id: plans[0].id, min_risk_score: 0, max_risk_score: 0.4, min_value_score: 0, max_value_score: 100 },
        { plan_id: plans[1].id, min_risk_score: 0.4, max_risk_score: 0.7, min_value_score: 0, max_value_score: 60 },
        { plan_id: plans[2].id, min_risk_score: 0.4, max_risk_score: 0.7, min_value_score: 61, max_value_score: 100 },
        { plan_id: plans[3].id, min_risk_score: 0.7, max_risk_score: 1, min_value_score: 50, max_value_score: 100 },
      ],
    });
    console.log('✅ Seeded retention_plans + allocation_rules');
  } else {
    // Ensure templates exist on older seeds
    const plans = await prisma.retentionPlan.findMany();
    for (const plan of plans) {
      if (!plan.email_template || !plan.sms_template) {
        await prisma.retentionPlan.update({
          where: { id: plan.id },
          data: {
            email_template:
              plan.email_template ||
              `Hi {{first_name}}, your bank prepared {{plan_name}} for you. Reply to this email anytime.`,
            sms_template:
              plan.sms_template ||
              `{{first_name}}: {{plan_name}} is ready. Reply YES to confirm with CustomerIQ.`,
          },
        });
      }
    }
  }
}

async function seedDemoBank() {
  let bank = await prisma.bank.findFirst({ where: { bank_name: 'Demo Mutual Bank' } });
  if (!bank) {
    bank = await prisma.bank.create({
      data: {
        bank_name: 'Demo Mutual Bank',
        nationality: 'ZW',
        license_number: 'DEMO-LIC-001',
        branch_code: 'HAR-01',
        api_access_key: `demo_${crypto.randomBytes(16).toString('hex')}`,
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created demo bank id=${bank.id}`);
  }

  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const existing = await prisma.bankUser.findUnique({ where: { email: DEMO_EMAIL } });
  if (!existing) {
    await prisma.bankUser.create({
      data: {
        bank_id: bank.id,
        first_name: 'Ada',
        last_name: 'Manager',
        email: DEMO_EMAIL,
        password_hash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    await prisma.bankUser.update({
      where: { email: DEMO_EMAIL },
      data: { password_hash, bank_id: bank.id, role: 'ADMIN' },
    });
    console.log(`✅ Demo login refreshed: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  return bank;
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randFloat = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

async function generateCustomers(numCustomers = 12, bankId) {
  console.log(`🌱 Seeding ${numCustomers} customers with contact + assessments...`);

  const names = [
    { first: 'Emma', last: 'Smith', gender: 'Female' },
    { first: 'Liam', last: 'Johnson', gender: 'Male' },
    { first: 'Olivia', last: 'Williams', gender: 'Female' },
    { first: 'Noah', last: 'Brown', gender: 'Male' },
    { first: 'Ava', last: 'Jones', gender: 'Female' },
    { first: 'Tendai', last: 'Moyo', gender: 'Male' },
    { first: 'Chipo', last: 'Ncube', gender: 'Female' },
    { first: 'Marcus', last: 'Berg', gender: 'Male' },
    { first: 'Sofia', last: 'Chen', gender: 'Female' },
    { first: 'James', last: 'Okoro', gender: 'Male' },
    { first: 'Amara', last: 'Diallo', gender: 'Female' },
    { first: 'Ethan', last: 'Khan', gender: 'Male' },
  ];
  const geos = ['Zimbabwe', 'South Africa', 'Kenya', 'France', 'Germany'];
  const plans = await prisma.retentionPlan.findMany({ orderBy: { id: 'asc' } });
  const cards = await prisma.refCardType.findMany({ orderBy: { id: 'asc' } });
  const products = await prisma.refBankProduct.findMany({ orderBy: { id: 'asc' } });

  const existingCount = await prisma.customerProfile.count({ where: { bank_id: bankId } });
  if (existingCount >= numCustomers) {
    console.log(`ℹ️ Bank already has ${existingCount} customers — skipping generation`);
    return;
  }

  const toCreate = numCustomers - existingCount;

  for (let i = 0; i < toCreate; i++) {
    const person = names[i % names.length];
    const uid = `CUST-${10000 + existingCount + i}`;
    const email = `${person.first.toLowerCase()}.${person.last.toLowerCase()}${existingCount + i}@demo.bank`;
    const phone = `+26377${String(200000 + existingCount + i).slice(-6)}`;

    const profile = await prisma.customerProfile.create({
      data: {
        bank_id: bankId,
        customer_uid: uid,
        first_name: person.first,
        last_name: person.last,
        email,
        phone,
        gender: person.gender,
        age: randInt(22, 75),
        geography: randElement(geos),
        credit_score: randInt(500, 850),
        tenure_years: randInt(1, 8),
        is_active_member: 1,
        has_cr_card: 1,
        card_type_id: cards[randInt(0, cards.length - 1)]?.id,
        joined_date: new Date('2023-01-15'),
      },
    });

    const monthlySalary = randFloat(3000, 12000);
    for (let m = 0; m < 3; m++) {
      await prisma.customerTransaction.create({
        data: {
          customer_id: profile.id,
          amount: monthlySalary,
          transaction_type: 'CREDIT',
          category: 'SALARY',
          description: 'Monthly Payroll Drop',
        },
      });
    }

    for (let d = 0; d < randInt(4, 8); d++) {
      const category = randElement(['PURCHASE', 'BILL_PAY', 'TRANSFER']);
      await prisma.customerTransaction.create({
        data: {
          customer_id: profile.id,
          amount: randFloat(50, 1500),
          transaction_type: 'DEBIT',
          category,
          description: `General ${category}`,
        },
      });
    }

    if (products.length) {
      await prisma.customerProductEnrollment.create({
        data: {
          customer_id: profile.id,
          product_id: products[randInt(0, products.length - 1)].id,
          enrolled_date: new Date('2023-02-01'),
          status: 'ACTIVE',
        },
      });
    }

    await prisma.customerLoyalty.create({
      data: {
        customer_id: profile.id,
        points_earned: randInt(100, 5000),
        satisfaction_score: randInt(2, 5),
      },
    });

    // Risk bands so every plan has someone
    const riskBands = [0.22, 0.48, 0.62, 0.78, 0.91];
    const risk = riskBands[i % riskBands.length] + randFloat(0, 0.05);
    const value = randInt(35, 95);
    let planId = plans[0]?.id;
    if (risk < 0.4) planId = plans[0]?.id;
    else if (risk < 0.7 && value <= 60) planId = plans[1]?.id;
    else if (risk < 0.7) planId = plans[2]?.id;
    else planId = plans[3]?.id || plans[2]?.id;

    await prisma.churnAssessment.create({
      data: {
        customer_id: profile.id,
        ai_risk_score: Math.min(0.99, risk),
        value_score: value,
        advised_plan_id: planId,
      },
    });

    console.log(`✅ ${person.first} ${person.last} · ${email} · risk=${risk.toFixed(2)}`);
  }
}

async function seedSampleCampaigns(bankId, userId) {
  const existing = await prisma.communicationCampaign.count({ where: { bank_id: bankId } });
  if (existing > 0) {
    console.log('ℹ️ Campaigns already present — skipping sample sends');
    return;
  }

  const vip = await prisma.retentionPlan.findFirst({ where: { name: 'VIP Rescue' } });
  const soft = await prisma.retentionPlan.findFirst({ where: { name: 'Soft Retention' } });
  const customers = await prisma.customerProfile.findMany({
    where: { bank_id: bankId },
    take: 6,
    orderBy: { id: 'asc' },
  });
  if (!customers.length) return;

  const emailCampaign = await prisma.communicationCampaign.create({
    data: {
      bank_id: bankId,
      plan_id: vip?.id,
      name: 'VIP Rescue email push',
      channel: 'EMAIL',
      subject: 'Your VIP Rescue package is ready',
      body: 'Hi {{first_name}}, your dedicated manager prepared a VIP Rescue package.',
      status: 'SENT',
      target_min_risk: 0.4,
      sent_count: Math.min(3, customers.length),
      failed_count: 0,
      created_by: userId,
      sent_at: new Date(),
    },
  });

  for (const c of customers.slice(0, 3)) {
    await prisma.communicationMessage.create({
      data: {
        campaign_id: emailCampaign.id,
        customer_id: c.id,
        channel: 'EMAIL',
        recipient: c.email || `${c.first_name}@demo.bank`,
        subject: 'Your VIP Rescue package is ready',
        body: `Hi ${c.first_name}, your dedicated manager prepared a VIP Rescue package.`,
        status: 'SENT',
        sent_at: new Date(),
      },
    });
  }

  const smsCampaign = await prisma.communicationCampaign.create({
    data: {
      bank_id: bankId,
      plan_id: soft?.id,
      name: 'Soft Retention SMS blast',
      channel: 'SMS',
      body: '{{first_name}}, fee waiver ready under Soft Retention. Reply YES.',
      status: 'SENT',
      target_min_risk: 0.4,
      sent_count: Math.min(3, customers.length),
      failed_count: 0,
      created_by: userId,
      sent_at: new Date(Date.now() - 86400000),
    },
  });

  for (const c of customers.slice(3, 6)) {
    await prisma.communicationMessage.create({
      data: {
        campaign_id: smsCampaign.id,
        customer_id: c.id,
        channel: 'SMS',
        recipient: c.phone || '+263770000000',
        body: `${c.first_name}, fee waiver ready under Soft Retention. Reply YES.`,
        status: 'SENT',
        sent_at: new Date(Date.now() - 86400000),
      },
    });
  }

  await prisma.aiPerformanceLog.create({
    data: {
      bank_id: bankId,
      total_customers_scanned: customers.length,
      high_risk_detected: Math.ceil(customers.length * 0.4),
      avg_confidence_score: 0.87,
      execution_time_ms: 1240,
    },
  });

  console.log('✅ Seeded sample email + SMS campaigns');
}

async function main() {
  await seedBaseline();
  const bank = await seedDemoBank();
  await generateCustomers(12, bank.id);
  const admin = await prisma.bankUser.findUnique({ where: { email: DEMO_EMAIL } });
  await seedSampleCampaigns(bank.id, admin?.id);
  console.log('\n🎉 Seed complete.');
  console.log(`   Login → ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
