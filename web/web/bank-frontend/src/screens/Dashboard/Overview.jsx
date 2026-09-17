import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  Users,
  AlertTriangle,
  Activity,
  ArrowRight,
  Zap,
  Megaphone,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Overview = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_customers: 0,
    high_risk_customers: 0,
    avg_bank_risk: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [overviewRes, popularityRes, customersRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/overview', { headers }),
          fetch('http://localhost:5000/api/dashboard/retention-popularity', { headers }),
          fetch('http://localhost:5000/api/dashboard/customers', { headers }),
        ]);

        if (!overviewRes.ok || !popularityRes.ok) {
          throw new Error('Failed to fetch dashboard data. Please check your connection.');
        }

        const overviewData = await overviewRes.json();
        const popularityData = await popularityRes.json();
        const customersData = customersRes.ok ? await customersRes.json() : null;

        if (overviewData.status === 'success') setStats(overviewData.data);
        if (popularityData.status === 'success') setChartData(popularityData.data);
        if (customersData?.status === 'success' || Array.isArray(customersData?.data)) {
          setCustomers((customersData.data || []).slice(0, 6));
        } else if (Array.isArray(customersData)) {
          setCustomers(customersData.slice(0, 6));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const formatPercent = (decimal) => `${((Number(decimal) || 0) * 100).toFixed(1)}%`;
  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);
  const riskPct = Math.min(100, Math.round((Number(stats.avg_bank_risk) || 0) * 100));
  const safePct = Math.max(0, 100 - riskPct);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        <h3 className="text-sm font-semibold">Error loading dashboard</h3>
        <p className="mt-1 text-[13px]">{error}</p>
      </div>
    );
  }

  const metricTiles = [
    {
      label: 'High risk',
      value: formatNumber(stats.high_risk_customers),
      accent: true,
      icon: AlertTriangle,
      delta: 'Action',
      up: false,
    },
    {
      label: 'Customers',
      value: formatNumber(stats.total_customers),
      icon: Users,
      delta: 'Live',
      up: true,
    },
    {
      label: 'Avg risk',
      value: formatPercent(stats.avg_bank_risk),
      icon: Activity,
      delta: `${riskPct}%`,
      up: riskPct < 50,
    },
    {
      label: 'Plans',
      value: formatNumber(chartData.length || 4),
      icon: TrendingUp,
      delta: 'Active',
      up: true,
    },
  ];

  const planFallback = [
    { name: 'VIP Rescue', assigned_count: 0 },
    { name: 'Soft Retention', assigned_count: 0 },
    { name: 'High-Touch Save', assigned_count: 0 },
  ];

  return (
    <div className="space-y-3 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-white">
            {greet}, {user?.first_name || 'Manager'}
          </h1>
          <p className="text-[13px] text-white/45">
            Churn risk, plans, and outreach in one workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="lime"
            className="h-8 rounded px-3 text-[12px]"
            onClick={() => navigate('/dashboard/batch')}
          >
            Run batch <Zap className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-8 rounded border-white/15 bg-transparent px-3 text-[12px] text-white hover:bg-white/5 hover:text-white"
            onClick={() => navigate('/dashboard/communications')}
          >
            <Megaphone className="h-3.5 w-3.5" /> Push plans
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="rounded border border-white/10 bg-[#111] p-4 lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">
                Portfolio risk score
              </p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-white">
                {formatPercent(stats.avg_bank_risk)}
              </p>
              <p
                className={cn(
                  'mt-1 inline-flex items-center gap-1 text-[12px] font-medium',
                  riskPct >= 50 ? 'text-red-400' : 'text-lime'
                )}
              >
                {riskPct >= 50 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {riskPct}% intensity
              </p>
            </div>
            <span className="rounded bg-lime/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime">
              Live
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              className="h-8 rounded bg-lime px-3 text-[12px] font-semibold text-black hover:bg-lime-soft"
              onClick={() => navigate('/dashboard/customers')}
            >
              Risk queue
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded border-white/15 bg-transparent px-3 text-[12px] text-white hover:bg-white/5"
              onClick={() => navigate('/dashboard/retention')}
            >
              Manage plans
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Safe', value: `${safePct}%` },
              { label: 'At risk', value: formatNumber(stats.high_risk_customers) },
              { label: 'Book', value: formatNumber(stats.total_customers) },
            ].map((w) => (
              <div key={w.label} className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/35">
                  {w.label}
                </p>
                <p className="mt-0.5 font-display text-base font-semibold text-white">{w.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:col-span-3">
          {metricTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                className={cn(
                  'rounded border p-3',
                  tile.accent
                    ? 'border-lime/40 bg-lime text-black'
                    : 'border-white/10 bg-[#111] text-white'
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={cn('h-3.5 w-3.5', tile.accent ? 'text-black/60' : 'text-white/40')}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-semibold',
                      tile.accent
                        ? 'text-black/55'
                        : tile.up
                          ? 'text-lime'
                          : 'text-red-400'
                    )}
                  >
                    {tile.delta}
                  </span>
                </div>
                <p className="mt-3 font-display text-xl font-semibold tracking-tight">{tile.value}</p>
                <p
                  className={cn(
                    'mt-0.5 text-[11px] font-medium',
                    tile.accent ? 'text-black/55' : 'text-white/40'
                  )}
                >
                  {tile.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded border border-white/10 bg-[#111] p-4 lg:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-white">Plan distribution</p>
              <p className="text-[11px] text-white/40">Assigned after scoring</p>
            </div>
            <button type="button" className="text-white/30 hover:text-white/70">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 h-44 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#737373', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#1a1a1a' }}
                    contentStyle={{
                      borderRadius: 4,
                      border: '1px solid #333',
                      background: '#111',
                      color: '#fff',
                      boxShadow: 'none',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="assigned_count" radius={[2, 2, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#C6F800' : '#404040'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded border border-dashed border-white/15 text-[12px] text-white/40">
                Run a batch to populate plans
              </div>
            )}
          </div>
        </div>

        <div className="rounded border border-white/10 bg-[#111] p-4 lg:col-span-4">
          <p className="text-[13px] font-semibold text-white">Risk coverage</p>
          <p className="mt-0.5 text-[11px] text-white/40">Book intensity vs safer band</p>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[12px] font-medium">
              <span className="text-white">{riskPct}% intensity</span>
              <span className="text-white/40">{safePct}% safer</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-white/10">
              <div
                className="h-full bg-lime transition-all duration-500"
                style={{ width: `${riskPct}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] text-white/45">
              {formatNumber(stats.high_risk_customers)} high-risk of{' '}
              {formatNumber(stats.total_customers)} customers
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {(chartData.length ? chartData.slice(0, 3) : planFallback).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-sm',
                      i === 0 ? 'bg-lime' : i === 1 ? 'bg-white' : 'bg-white/30'
                    )}
                  />
                  <span className="text-[12px] font-medium text-white/70">{p.name}</span>
                </div>
                <span className="font-display text-[12px] font-semibold text-white">
                  {p.assigned_count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-white/10 bg-[#111] p-4 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-white">Active plans</p>
            <Button
              variant="outline"
              className="h-7 rounded border-white/15 bg-transparent px-2.5 text-[11px] text-white hover:bg-white/5"
              onClick={() => navigate('/dashboard/retention')}
            >
              Manage
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(chartData.length ? chartData.slice(0, 2) : planFallback.slice(0, 2)).map(
              (plan, i) => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={() => navigate('/dashboard/communications')}
                  className={cn(
                    'rounded border p-4 text-left transition-colors',
                    i === 0
                      ? 'border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.07]'
                      : 'border-lime/40 bg-lime text-black hover:bg-lime-soft'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <ShieldCheck
                      className={cn('h-4 w-4', i === 0 ? 'text-lime' : 'text-black/70')}
                    />
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        i === 0 ? 'bg-white/10 text-white/60' : 'bg-black/10 text-black/60'
                      )}
                    >
                      Active
                    </span>
                  </div>
                  <p className="mt-5 text-[14px] font-semibold tracking-tight">{plan.name}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p
                        className={cn(
                          'text-[10px] font-medium uppercase tracking-wide',
                          i === 0 ? 'text-white/40' : 'text-black/45'
                        )}
                      >
                        Assigned
                      </p>
                      <p className="font-display text-xl font-semibold">{plan.assigned_count}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[11px] font-semibold',
                        i === 0 ? 'text-lime' : 'text-black/70'
                      )}
                    >
                      Push <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded border border-white/10 bg-[#111] p-4 lg:col-span-12">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-white">Recent risk queue</p>
              <p className="text-[11px] text-white/40">Assessed customers ready for outreach</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                <input
                  readOnly
                  placeholder="Search"
                  className="h-8 rounded border border-white/15 bg-white/[0.04] pl-8 pr-3 text-[12px] text-white outline-none placeholder:text-white/30"
                />
              </div>
              <Button
                variant="outline"
                className="h-8 rounded border-white/15 bg-transparent px-3 text-[12px] text-white hover:bg-white/5"
                onClick={() => navigate('/dashboard/customers')}
              >
                View all
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  <th className="pb-2 pr-3 font-semibold">Customer</th>
                  <th className="pb-2 pr-3 font-semibold">Risk</th>
                  <th className="pb-2 pr-3 font-semibold">Value</th>
                  <th className="pb-2 pr-3 font-semibold">Plan</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[13px] text-white/40">
                      No customers loaded yet. Seed data or run ingestion.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const risk = Number(c.ai_risk_score ?? c.risk_score ?? c.risk ?? 0);
                    const riskPctRow = Math.round(risk * (risk <= 1 ? 100 : 1));
                    const plan =
                      c.advised_plan_name || c.plan_name || c.retention_plan || 'Unassigned';
                    const name =
                      c.full_name ||
                      `${c.first_name || ''} ${c.last_name || ''}`.trim() ||
                      c.customer_uid ||
                      'Customer';
                    const high = riskPctRow >= 70;
                    return (
                      <tr
                        key={c.id || c.customer_uid || name}
                        className="border-b border-white/5 text-[13px] hover:bg-white/[0.03]"
                      >
                        <td className="py-2.5 pr-3 font-medium text-white">{name}</td>
                        <td className="py-2.5 pr-3 font-display font-semibold tabular-nums text-white/90">
                          {riskPctRow}%
                        </td>
                        <td className="py-2.5 pr-3 text-white/45">
                          {c.value_score ?? c.value ?? '—'}
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-white/70">{plan}</td>
                        <td className="py-2.5">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium',
                              high
                                ? 'bg-red-500/15 text-red-300'
                                : 'bg-lime/15 text-lime'
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-sm',
                                high ? 'bg-red-400' : 'bg-lime'
                              )}
                            />
                            {high ? 'High risk' : 'Monitor'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
