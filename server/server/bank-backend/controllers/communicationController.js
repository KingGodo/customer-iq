const prisma = require('../config/db');

const personalize = (template, customer, planName) => {
  const first = customer.first_name || 'Customer';
  const last = customer.last_name || '';
  return String(template || '')
    .replace(/\{\{first_name\}\}/gi, first)
    .replace(/\{\{last_name\}\}/gi, last)
    .replace(/\{\{full_name\}\}/gi, `${first} ${last}`.trim())
    .replace(/\{\{plan_name\}\}/gi, planName || 'your retention plan')
    .replace(/\{\{customer_uid\}\}/gi, customer.customer_uid || '');
};

const getAudience = async (bankId, { planId, minRisk = 0.4 }) => {
  const customers = await prisma.customerProfile.findMany({
    where: { bank_id: bankId, is_active_member: 1 },
    include: {
      assessments: {
        orderBy: { assessment_date: 'desc' },
        take: 1,
        include: { advised_plan: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  return customers.filter((c) => {
    const latest = c.assessments[0];
    if (!latest) return false;
    if (Number(latest.ai_risk_score) < Number(minRisk)) return false;
    if (planId && latest.advised_plan_id !== Number(planId)) return false;
    return true;
  });
};

exports.getOverview = async (req, res) => {
  try {
    const bankId = req.user.bank_id;

    const [campaigns, emailSent, smsSent, queued] = await Promise.all([
      prisma.communicationCampaign.count({ where: { bank_id: bankId } }),
      prisma.communicationMessage.count({
        where: { channel: 'EMAIL', status: 'SENT', campaign: { bank_id: bankId } },
      }),
      prisma.communicationMessage.count({
        where: { channel: 'SMS', status: 'SENT', campaign: { bank_id: bankId } },
      }),
      prisma.communicationMessage.count({
        where: { status: 'QUEUED', campaign: { bank_id: bankId } },
      }),
    ]);

    const recent = await prisma.communicationCampaign.findMany({
      where: { bank_id: bankId },
      include: {
        plan: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    const plans = await prisma.retentionPlan.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        bank_investment: true,
        actionable_steps: true,
        email_template: true,
        sms_template: true,
      },
    });

    res.json({
      status: 'success',
      data: {
        stats: { campaigns, emailSent, smsSent, queued },
        campaigns: recent,
        plans,
      },
    });
  } catch (error) {
    console.error('comms overview error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.previewAudience = async (req, res) => {
  try {
    const bankId = req.user.bank_id;
    const planId = req.query.plan_id ? Number(req.query.plan_id) : null;
    const minRisk = req.query.min_risk != null ? Number(req.query.min_risk) : 0.4;

    const audience = await getAudience(bankId, { planId, minRisk });

    res.json({
      status: 'success',
      data: {
        count: audience.length,
        customers: audience.slice(0, 25).map((c) => ({
          id: c.id,
          customer_uid: c.customer_uid,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          phone: c.phone,
          risk: c.assessments[0]?.ai_risk_score ?? null,
          plan: c.assessments[0]?.advised_plan?.name ?? null,
        })),
      },
    });
  } catch (error) {
    console.error('comms preview error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const bankId = req.user.bank_id;
    const id = Number(req.params.id);

    const campaign = await prisma.communicationCampaign.findFirst({
      where: { id, bank_id: bankId },
      include: {
        plan: true,
        messages: {
          include: {
            customer: {
              select: { id: true, first_name: true, last_name: true, customer_uid: true },
            },
          },
          orderBy: { id: 'desc' },
          take: 100,
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    res.json({ status: 'success', data: campaign });
  } catch (error) {
    console.error('comms campaign error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.sendCampaign = async (req, res) => {
  try {
    const bankId = req.user.bank_id;
    const {
      name,
      channel,
      plan_id,
      subject,
      body,
      min_risk = 0.4,
      customer_ids,
    } = req.body;

    if (!channel || !['EMAIL', 'SMS'].includes(channel)) {
      return res.status(400).json({ status: 'error', message: 'channel must be EMAIL or SMS' });
    }
    if (!body || !String(body).trim()) {
      return res.status(400).json({ status: 'error', message: 'Message body is required' });
    }
    if (channel === 'EMAIL' && (!subject || !String(subject).trim())) {
      return res.status(400).json({ status: 'error', message: 'Email subject is required' });
    }

    const plan = plan_id
      ? await prisma.retentionPlan.findUnique({ where: { id: Number(plan_id) } })
      : null;

    let audience = await getAudience(bankId, {
      planId: plan_id ? Number(plan_id) : null,
      minRisk: Number(min_risk) || 0,
    });

    if (Array.isArray(customer_ids) && customer_ids.length) {
      const idSet = new Set(customer_ids.map(Number));
      audience = audience.filter((c) => idSet.has(c.id));
    }

    if (!audience.length) {
      // Fall back: any active customers with contact info (for demo without batch)
      audience = await prisma.customerProfile.findMany({
        where: {
          bank_id: bankId,
          is_active_member: 1,
          ...(channel === 'EMAIL' ? { email: { not: null } } : { phone: { not: null } }),
        },
        take: 50,
        include: {
          assessments: {
            orderBy: { assessment_date: 'desc' },
            take: 1,
            include: { advised_plan: true },
          },
        },
      });
    }

    if (!audience.length) {
      return res.status(400).json({
        status: 'error',
        message: 'No eligible customers with contact details for this campaign',
      });
    }

    const campaign = await prisma.communicationCampaign.create({
      data: {
        bank_id: bankId,
        plan_id: plan?.id ?? null,
        name: name || `${channel} · ${plan?.name || 'Retention push'}`,
        channel,
        subject: channel === 'EMAIL' ? subject : null,
        body,
        status: 'SENDING',
        target_min_risk: Number(min_risk) || 0,
        created_by: req.user.id,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const customer of audience) {
      const planName = customer.assessments?.[0]?.advised_plan?.name || plan?.name;
      const personalizedBody = personalize(body, customer, planName);
      const personalizedSubject =
        channel === 'EMAIL' ? personalize(subject, customer, planName) : null;

      const recipient = channel === 'EMAIL' ? customer.email : customer.phone;
      if (!recipient) {
        await prisma.communicationMessage.create({
          data: {
            campaign_id: campaign.id,
            customer_id: customer.id,
            channel,
            recipient: '',
            subject: personalizedSubject,
            body: personalizedBody,
            status: 'SKIPPED',
            error_message: channel === 'EMAIL' ? 'Missing email' : 'Missing phone',
          },
        });
        failedCount += 1;
        continue;
      }

      // Demo delivery: persist as SENT (wire Twilio/Resend later via env)
      await prisma.communicationMessage.create({
        data: {
          campaign_id: campaign.id,
          customer_id: customer.id,
          channel,
          recipient,
          subject: personalizedSubject,
          body: personalizedBody,
          status: 'SENT',
          sent_at: new Date(),
        },
      });
      sentCount += 1;
      console.log(`[comms] ${channel} → ${recipient}: ${personalizedBody.slice(0, 80)}`);
    }

    const updated = await prisma.communicationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: sentCount > 0 ? 'SENT' : 'FAILED',
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date(),
      },
      include: {
        plan: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    });

    res.status(201).json({
      status: 'success',
      data: updated,
      message: `Pushed ${sentCount} ${channel === 'EMAIL' ? 'emails' : 'SMS'} for retention`,
    });
  } catch (error) {
    console.error('comms send error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
