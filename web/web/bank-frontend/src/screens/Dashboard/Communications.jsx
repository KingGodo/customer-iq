import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Mail, MessageSquare, Send, Megaphone, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const API = 'http://localhost:5000/api';

const Communications = () => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ campaigns: 0, emailSent: 0, smsSent: 0, queued: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [plans, setPlans] = useState([]);
  const [preview, setPreview] = useState({ count: 0, customers: [] });

  const [channel, setChannel] = useState('EMAIL');
  const [planId, setPlanId] = useState('');
  const [minRisk, setMinRisk] = useState('0.4');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const selectedPlan = plans.find((p) => String(p.id) === String(planId));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/dashboard/communications`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load communications');
      setStats(data.data.stats);
      setCampaigns(data.data.campaigns || []);
      setPlans(data.data.plans || []);
      if (!planId && data.data.plans?.[1]) {
        setPlanId(String(data.data.plans[1].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (pid = planId, risk = minRisk) => {
    try {
      const qs = new URLSearchParams({
        plan_id: pid || '',
        min_risk: risk || '0',
        channel,
      });
      const res = await fetch(`${API}/dashboard/communications/preview?${qs}`, { headers });
      const data = await res.json();
      if (res.ok) setPreview(data.data || { count: 0, customers: [] });
    } catch {
      /* preview is best-effort */
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, planId, minRisk, channel]);

  useEffect(() => {
    if (!selectedPlan) return;
    if (channel === 'EMAIL') {
      setSubject((s) => s || `${selectedPlan.name} for {{first_name}}`);
      setBody(selectedPlan.email_template || '');
    } else {
      setBody(selectedPlan.sms_template || '');
    }
    setName((n) => n || `${selectedPlan.name} ${channel === 'EMAIL' ? 'email' : 'SMS'} push`);
  }, [selectedPlan?.id, channel]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API}/dashboard/communications/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          channel,
          plan_id: planId ? Number(planId) : null,
          subject: channel === 'EMAIL' ? subject : undefined,
          body,
          min_risk: Number(minRisk) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Send failed');
      setSuccess(data.message || 'Campaign sent');
      await load();
      await loadPreview();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-white">
            Communications
          </h1>
          <p className="text-[13px] text-white/50">
            Push retention plans to at-risk customers by email or SMS.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 rounded border-white/15 bg-transparent px-3 text-[12px] text-white hover:bg-white/5"
          onClick={load}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Campaigns', value: stats.campaigns, icon: Megaphone, accent: true },
          { label: 'Emails sent', value: stats.emailSent, icon: Mail },
          { label: 'SMS sent', value: stats.smsSent, icon: MessageSquare },
          { label: 'Audience preview', value: preview.count, icon: Users },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              'rounded border p-3',
              s.accent
                ? 'border-lime/40 bg-lime text-black'
                : 'border-white/10 bg-[#111] text-white'
            )}
          >
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-[11px] font-medium',
                  s.accent ? 'text-black/55' : 'text-white/40'
                )}
              >
                {s.label}
              </p>
              <s.icon className={cn('h-3.5 w-3.5', s.accent ? 'text-black/60' : 'text-white/40')} />
            </div>
            <p className="mt-2 font-display text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSend}
          className="rounded border border-white/10 bg-[#111] p-4"
        >
          <div className="flex gap-1 rounded bg-white/[0.06] p-0.5">
            {['EMAIL', 'SMS'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={cn(
                  'rounded px-3 py-1.5 text-[12px] font-medium transition-colors',
                  channel === c
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white'
                )}
              >
                {c === 'EMAIL' ? 'Email' : 'SMS'}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Retention plan
              </span>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="h-9 w-full rounded border border-white/10 bg-white/[0.04] px-2.5 text-[13px] font-medium text-white outline-none focus:border-lime"
              >
                <option value="">All high-risk plans</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Min risk score
              </span>
              <Input
                value={minRisk}
                onChange={(e) => setMinRisk(e.target.value)}
                className="h-9 rounded border-white/10 bg-white/[0.04]"
                placeholder="0.4"
              />
            </label>
          </div>

          <label className="mt-3 block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Campaign name
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded border-white/10 bg-white/[0.04]"
              required
            />
          </label>

          {channel === 'EMAIL' && (
            <label className="mt-3 block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                Subject
              </span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 rounded border-white/10 bg-white/[0.04]"
                required
              />
            </label>
          )}

          <label className="mt-3 block space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              Message body
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={channel === 'SMS' ? 3 : 5}
              required
              className="w-full rounded border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[13px] font-medium text-white outline-none focus:border-lime"
            />
            <p className="text-[11px] text-white/40">
              Tokens: {'{{first_name}}'}, {'{{plan_name}}'}, {'{{customer_uid}}'}
            </p>
          </label>

          {error && (
            <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-3 rounded border border-lime/40 bg-lime/20 px-3 py-2 text-[13px] font-medium text-white">
              {success}
            </div>
          )}

          <Button
            type="submit"
            variant="lime"
            disabled={sending}
            className="mt-3 h-8 rounded px-3 text-[12px] font-semibold"
          >
            {sending ? 'Sending…' : `Push ${channel === 'EMAIL' ? 'emails' : 'SMS'}`}
            <Send className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </form>

        <div className="space-y-3">
          <div className="rounded border border-white/10 bg-[#111] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-white">Audience</h2>
              <Badge variant="lime">{preview.count} ready</Badge>
            </div>
            <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
              {preview.customers.length === 0 && (
                <li className="text-[13px] text-white/40">
                  No scored customers yet. Seed data includes contacts after login.
                </li>
              )}
              {preview.customers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded border border-white/10 bg-white/[0.04] px-2.5 py-2"
                >
                  <div>
                    <p className="text-[13px] font-medium text-white">{c.name}</p>
                    <p className="text-[11px] text-white/40">
                      {channel === 'EMAIL' ? c.email : c.phone} · {c.plan || 'Unassigned'}
                    </p>
                  </div>
                  <span className="font-display text-[13px] font-semibold text-white/90">
                    {c.risk != null ? Number(c.risk).toFixed(2) : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-white/10 bg-[#111] p-4">
            <h2 className="text-[13px] font-semibold text-white">Recent campaigns</h2>
            <ul className="mt-3 space-y-2">
              {campaigns.length === 0 && (
                <li className="text-[13px] text-white/40">No campaigns yet.</li>
              )}
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="rounded border border-white/10 bg-white/[0.04] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-white">{c.name}</p>
                    <Badge
                      className={cn(
                        'rounded border-0 text-[10px]',
                        c.channel === 'EMAIL' ? 'bg-lime text-black' : 'bg-white/10 text-white'
                      )}
                    >
                      {c.channel}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {c.plan?.name || 'All plans'} · {c._count?.messages ?? c.sent_count ?? 0} sent ·{' '}
                    {c.status}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;
