import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  Database,
  FileSpreadsheet,
  KeyRound,
  ShieldCheck,
  Users,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CHART = [
  { m: 'Mon', v: 32 },
  { m: 'Tue', v: 48 },
  { m: 'Wed', v: 41 },
  { m: 'Thu', v: 62 },
  { m: 'Fri', v: 55 },
  { m: 'Sat', v: 70 },
  { m: 'Sun', v: 58 },
];

const FEATURES = [
  'AI churn risk scoring for every active customer',
  'Value scoring from balances, salary, and loyalty',
  'Retention plans assigned by risk and value rules',
  'Push plans by SMS and email from one communications desk',
  'CSV ingest or bank API sync into one workspace',
];

const STEPS = [
  {
    n: '01',
    title: 'Connect the book',
    body: 'Register your bank, create an admin account, and load customers through the ingest wizard or your API key.',
  },
  {
    n: '02',
    title: 'Score the portfolio',
    body: 'Run a batch assessment. The model estimates flight risk while rules calculate relationship value from live features.',
  },
  {
    n: '03',
    title: 'Act from the queue',
    body: 'Managers open the risk list, open a customer profile, and execute the assigned plan before the account closes.',
  },
];

const QUEUE = [
  { name: 'M. Okonkwo', segment: 'SME Current', risk: 86, plan: 'VIP Rescue' },
  { name: 'A. Bergstrom', segment: 'Wealth', risk: 71, plan: 'Soft Retention' },
  { name: 'L. Chen', segment: 'Payroll Plus', risk: 42, plan: 'Standard Monitor' },
  { name: 'S. Ncube', segment: 'Retail Plus', risk: 78, plan: 'High Touch Save' },
];

const AUDIENCE = [
  {
    icon: Users,
    title: 'Branch managers',
    body: 'Work a prioritized risk queue instead of scanning every dormant account by hand.',
  },
  {
    icon: ShieldCheck,
    title: 'Retention leads',
    body: 'Tune value weights and allocation rules so spend lands on relationships worth saving.',
  },
  {
    icon: Database,
    title: 'Bank IT teams',
    body: 'Push customers, transactions, products, and loyalty through authenticated sync endpoints.',
  },
];

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'queue', label: 'My Cards' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState({});

  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const offsets = NAV_ITEMS.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: Infinity };
        return { id: item.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
      });
      offsets.sort((a, b) => a.top - b.top);
      if (offsets[0]) setActiveNav(offsets[0].id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = ['how', 'features', 'queue', 'about'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const onHeroMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({ x: px * 12, y: py * -8 });
  };

  const onHeroLeave = () => setHeroTilt({ x: 0, y: 0 });

  return (
    <div className="min-h-screen overflow-x-hidden font-sans text-neutral-900">
      <div
        className="relative"
        style={{
          background:
            'linear-gradient(180deg, #050505 0%, #0a0c0b 12%, #121816 28%, #2a3d34 42%, #6b8f7a 52%, #c8d5cc 60%, #eef0ef 68%, #f7f7f7 74%, #ffffff 80%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[68vh] opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
          }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute left-[12%] top-[22%] h-28 w-40 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-[2px] transition-transform duration-700 ease-out will-change-transform" style={{ transform: `translate(${heroTilt.x * 0.3}px, ${heroTilt.y * 0.3}px)` }} />
          <div className="absolute left-[28%] top-[38%] h-20 w-32 rounded-xl border border-white/[0.08] bg-white/[0.03] transition-transform duration-700 ease-out" style={{ transform: `translate(${heroTilt.x * -0.2}px, ${heroTilt.y * 0.4}px)` }} />
          <div className="absolute right-[42%] top-[18%] h-24 w-36 rounded-2xl border border-white/10 bg-white/[0.05] transition-transform duration-700 ease-out" style={{ transform: `translate(${heroTilt.x * 0.4}px, ${heroTilt.y * -0.2}px)` }} />
          <div className="absolute right-[18%] top-[42%] h-16 w-28 rounded-xl border border-white/[0.07] bg-white/[0.03] transition-transform duration-700 ease-out" style={{ transform: `translate(${heroTilt.x * -0.35}px, ${heroTilt.y * 0.25}px)` }} />
        </div>

        <header
          className={cn(
            'sticky top-0 z-40 transition-all duration-300',
            scrolled
              ? 'border-b border-white/10 bg-[#050505]/80 shadow-lg backdrop-blur-xl'
              : 'bg-transparent'
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
            <button
              type="button"
              onClick={() => scrollTo('home')}
              className="group flex items-center gap-2.5 transition hover:opacity-90"
            >
              <span className="relative flex h-7 w-7 items-center justify-center transition group-hover:scale-105">
                <span className="absolute h-5 w-5 rounded-md bg-white/90" />
                <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-sm bg-lime transition group-hover:rotate-6" />
                <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-sm bg-lime/80" />
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight text-white">
                CustomerIQ
              </span>
            </button>

            <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-black/35 px-1.5 py-1.5 shadow-lg backdrop-blur-md lg:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all duration-200',
                    activeNav === item.id
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="lime"
                onClick={() => navigate('/login')}
                className="rounded-full px-5 font-display text-[13px] font-semibold shadow-none transition hover:scale-[1.03] hover:brightness-105 active:scale-[0.98]"
              >
                Sign in
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileOpen && (
            <div className="border-t border-white/10 bg-[#050505]/95 px-6 py-4 backdrop-blur-xl lg:hidden">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      'rounded-xl px-4 py-3 text-left text-sm font-semibold transition',
                      activeNav === item.id
                        ? 'bg-lime text-black'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        <section
          id="home"
          className="relative z-20"
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
        >
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-6 pb-8 pt-8 lg:grid-cols-[1fr_1.15fr] lg:gap-4 lg:px-10 lg:pb-6 lg:pt-12">
            <div className="relative z-10 max-w-xl animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="font-display text-[2.4rem] font-bold leading-[1.05] tracking-tight text-white sm:text-[3rem] lg:text-[3.4rem]">
                Effortless Finance
                <br />
                for a Smarter Future
              </h1>
              <p className="mt-5 max-w-[22rem] text-[14px] font-medium leading-relaxed text-white/50">
                Track expenses, optimize budgets, grow your wealth, and unlock AI-driven financial
                insights — all in one secure digital banking experience.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  variant="lime"
                  className="group h-12 rounded-full pl-6 pr-1.5 font-display text-[13px] font-semibold shadow-none transition hover:scale-[1.03] hover:brightness-105 active:scale-[0.98]"
                  onClick={() => navigate('/register')}
                >
                  Start for free
                  <span className="ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-sm transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/20 bg-transparent px-5 font-display text-[13px] font-semibold text-white transition hover:bg-white/10 hover:text-white"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-visible lg:min-h-[440px] lg:justify-end">
              <div
                className="w-full max-w-[40rem] transition-transform duration-300 ease-out will-change-transform lg:mr-[-8%] lg:max-w-[48rem]"
                style={{
                  transform: `translate3d(${heroTilt.x}px, ${heroTilt.y}px, 0) rotate(${heroTilt.x * 0.12}deg)`,
                }}
              >
                <img
                  src="/customeriq-hero-hand.png?v=6"
                  alt="Hand holding a CustomerIQ premium account card"
                  className="relative z-10 w-full scale-110 bg-transparent object-contain object-right lg:scale-125"
                  width={1200}
                  height={900}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative z-20 border-y border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10 lg:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 -space-x-2">
              {[
                'https://i.pravatar.cc/64?img=12',
                'https://i.pravatar.cc/64?img=32',
                'https://i.pravatar.cc/64?img=5',
              ].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white object-cover ring-1 ring-black/5"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <p className="text-[13px] font-medium leading-snug text-neutral-500">
              <span className="font-display font-bold text-neutral-900">Built for branches</span>
              <span className="text-neutral-300"> · </span>
              Pilot retention workspace, not a vanity dashboard
            </p>
          </div>

          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:justify-end">
            {[
              { n: '4', l: 'Plan tiers' },
              { n: '2', l: 'Ingest paths' },
              { n: '1', l: 'Risk queue' },
            ].map((s, i) => (
              <div
                key={s.l}
                className={cn(
                  'flex items-baseline gap-1.5',
                  i > 0 && 'sm:border-l sm:border-neutral-200 sm:pl-6'
                )}
              >
                <dt className="font-display text-lg font-bold tabular-nums text-neutral-900">{s.n}</dt>
                <dd className="text-[12px] font-medium text-neutral-500">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="bg-white">
        <section
          id="how"
          className={cn(
            'relative z-10 bg-white transition-all duration-700',
            visible.how ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
        >
          <div className="mx-auto max-w-5xl px-8 py-16 lg:px-12 lg:py-20">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              How it works
            </p>
            <h2 className="mt-3 max-w-xl font-display text-[1.75rem] font-bold tracking-tight text-neutral-900 sm:text-[2rem]">
              From raw bank data to a manager action in one loop
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] font-medium leading-relaxed text-neutral-500">
              CustomerIQ scores the customers and activity you already hold, then writes assessments
              your branch team can execute.
            </p>
            <ol className="mt-12 grid gap-0 md:grid-cols-3 md:divide-x md:divide-neutral-200">
              {STEPS.map((step, i) => (
                <li
                  key={step.n}
                  className={cn(
                    'group relative py-2 md:px-8',
                    i === 0 ? 'md:pl-0' : '',
                    i === STEPS.length - 1 ? 'md:pr-0' : ''
                  )}
                >
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 transition group-hover:text-black">
                    Step {step.n}
                  </span>
                  <h3 className="mt-3 font-display text-[17px] font-bold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-neutral-500">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features + UI cards */}
        <section
          id="features"
          className={cn(
            'relative z-10 bg-white transition-all duration-700',
            visible.features ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
        >
          <div className="mx-auto grid max-w-5xl items-center gap-12 border-t border-black/5 px-8 py-16 lg:grid-cols-2 lg:gap-14 lg:px-12 lg:py-20">
            <div>
              <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight text-neutral-900 sm:text-[2rem]">
                Smarter retention. Better decisions.
              </h2>
              <p className="mt-4 text-[14px] font-medium leading-relaxed text-neutral-500">
                Every assessment pairs an AI risk score with a rules based value score. The
                allocation matrix picks the retention plan so managers are not guessing.
              </p>
              <ul className="mt-6 space-y-3">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-[14px] font-medium text-neutral-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-black">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant="lime"
                className="mt-8 h-11 rounded-full pl-5 pr-2 font-display text-[13px] font-semibold shadow-none"
                onClick={() => navigate('/login')}
              >
                Explore More
                <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/15">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Button>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#0c1210] text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      Live preview
                    </p>
                    <p className="mt-1 font-display text-[15px] font-bold">Risk pulse</p>
                  </div>
                  <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-black text-black">
                    Demo
                  </span>
                </div>

                <div className="px-5 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-white/40">Avg portfolio risk</p>
                      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-lime">
                        0.58
                      </p>
                    </div>
                    <p className="pb-1 text-[11px] font-medium text-white/35">This week</p>
                  </div>
                  <div className="mt-3 h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART}>
                        <defs>
                          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C6F800" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#C6F800" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="m" hide />
                        <YAxis hide domain={[20, 80]} />
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke="#C6F800"
                          strokeWidth={2}
                          fill="url(#spendFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-2 px-5 pb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Assigned plans
                  </p>
                  {[
                    { name: 'VIP Rescue', meta: 'High value · elevated risk', tone: 'bg-lime text-black' },
                    { name: 'Soft Retention', meta: 'Mid risk · offer path', tone: 'bg-white/10 text-white' },
                    { name: 'High-Touch Save', meta: 'Critical · executive path', tone: 'bg-white/10 text-white' },
                  ].map((plan) => (
                    <button
                      key={plan.name}
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left transition hover:border-lime/40 hover:bg-white/[0.08]"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-white">{plan.name}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-white/40">{plan.meta}</p>
                      </div>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', plan.tone)}>
                        Open
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data ingest */}
        <section className="relative z-10 bg-neutral-50">
          <div className="mx-auto max-w-5xl px-8 py-16 lg:px-12 lg:py-20">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Data in
            </p>
            <h2 className="mt-3 max-w-lg font-display text-[1.75rem] font-bold tracking-tight text-neutral-900 sm:text-[2rem]">
              Bring the book your way
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] font-medium leading-relaxed text-neutral-500">
              Pilot with files, then graduate to live sync. Both paths write into the same
              Postgres models your dashboard already reads.
            </p>
            <div className="mt-10 grid gap-0 overflow-hidden rounded-[1.5rem] border border-black/5 bg-white md:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate('/ingest-wizard')}
                className="group border-b border-black/5 p-7 text-left transition hover:bg-neutral-50 md:border-b-0 md:border-r"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lime transition group-hover:scale-105">
                  <FileSpreadsheet className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-bold">CSV wizard</h3>
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-neutral-500">
                  Step through card types, products, retention plans, customers, loyalty, and
                  transactions. Ideal for branch pilots.
                </p>
                <p className="mt-5 text-[12px] font-bold text-neutral-900 transition group-hover:text-lime">
                  Open wizard →
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="group p-7 text-left transition hover:bg-neutral-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-black transition group-hover:scale-105">
                  <KeyRound className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-[17px] font-bold">API sync</h3>
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-neutral-500">
                  Authenticate with your bank API key and push customers, transactions, products,
                  and loyalty on a schedule.
                </p>
                <p className="mt-5 text-[12px] font-bold text-neutral-900 transition group-hover:text-lime">
                  View API settings →
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* Risk queue */}
        <section
          id="queue"
          className={cn(
            'relative z-10 bg-white transition-all duration-700',
            visible.queue ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
        >
          <div className="mx-auto max-w-5xl px-8 py-16 lg:px-12 lg:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Risk queue
                </p>
                <h2 className="mt-3 font-display text-[1.75rem] font-bold tracking-tight text-neutral-900 sm:text-[2rem]">
                  What managers open after login
                </h2>
                <p className="mt-3 max-w-xl text-[14px] font-medium leading-relaxed text-neutral-500">
                  Sample rows that mirror the customer risk directory. High risk accounts rise
                  first with the advised plan attached.
                </p>
              </div>
              <Button
                variant="outline"
                className="h-10 rounded-full px-5 font-display text-[13px] font-semibold"
                onClick={() => navigate('/login')}
              >
                Open dashboard
              </Button>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
              <div className="hidden grid-cols-[1.3fr_1fr_0.6fr_1.1fr] gap-4 border-b border-black/5 bg-neutral-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 sm:grid">
                <span>Customer</span>
                <span>Segment</span>
                <span>Risk</span>
                <span>Plan</span>
              </div>
              <ul>
                {QUEUE.map((row) => (
                  <li
                    key={row.name}
                    className="grid grid-cols-1 gap-1 border-b border-black/5 px-5 py-4 transition hover:bg-lime/10 last:border-0 sm:grid-cols-[1.3fr_1fr_0.6fr_1.1fr] sm:items-center sm:gap-4"
                  >
                    <span className="text-[14px] font-bold text-neutral-900">{row.name}</span>
                    <span className="text-[13px] font-medium text-neutral-500">{row.segment}</span>
                    <span
                      className={cn(
                        'font-display text-[14px] font-bold tabular-nums',
                        row.risk >= 70 ? 'text-neutral-900' : 'text-neutral-500'
                      )}
                    >
                      {row.risk}%
                      {row.risk >= 70 && (
                        <span className="ml-2 rounded bg-lime px-1.5 py-0.5 text-[9px] font-black text-black">
                          HIGH
                        </span>
                      )}
                    </span>
                    <span className="text-[13px] font-semibold text-neutral-700">{row.plan}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="relative z-10 bg-neutral-50">
          <div className="mx-auto max-w-5xl px-8 py-16 lg:px-12 lg:py-20">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Who it is for
            </p>
            <h2 className="mt-3 max-w-lg font-display text-[1.75rem] font-bold tracking-tight text-neutral-900 sm:text-[2rem]">
              One product across branch, retention, and IT
            </h2>
            <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
              {AUDIENCE.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.title}
                    className="group flex flex-col gap-4 py-7 transition sm:flex-row sm:items-start sm:gap-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-lime transition group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[16px] font-bold text-neutral-900">
                        {a.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-[13px] font-medium leading-relaxed text-neutral-500">
                        {a.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About + CTA */}
        <section
          id="about"
          className={cn(
            'relative z-10 bg-white transition-all duration-700',
            visible.about ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
        >
          <div className="mx-auto max-w-5xl px-8 py-16 lg:px-12 lg:py-20">
            <div className="rounded-3xl bg-[#0c1210] px-8 py-12 text-white lg:px-12 lg:py-14">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-lime">
                    About CustomerIQ
                  </p>
                  <h2 className="mt-3 font-display text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
                    Retention intelligence built for real branch work
                  </h2>
                  <p className="mt-4 text-[14px] font-medium leading-relaxed text-white/55">
                    CustomerIQ combines a Keras churn model with a database driven rules engine. Banks
                    onboard once, load the book, run batch scoring, and give managers a clear queue
                    with plans they can act on.
                  </p>
                  <p className="mt-3 text-[14px] font-medium leading-relaxed text-white/55">
                    Start with a pilot branch on CSV. Move to API sync when your core systems are
                    ready to push continuous updates.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Button
                    variant="lime"
                    className="h-11 rounded-full px-6 font-display text-[13px] font-semibold shadow-none"
                    onClick={() => navigate('/register')}
                  >
                    Register your branch
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-white/20 bg-transparent px-6 font-display text-[13px] font-semibold text-white hover:bg-white/10 hover:text-white"
                    onClick={() => navigate('/login')}
                  >
                    Manager login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="relative z-10 border-t border-black/5 bg-[#0c1210] text-white">
          <div className="mx-auto max-w-5xl px-8 py-14 lg:px-12 lg:py-16">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5">
                    <span className="h-4 w-1.5 -skew-x-12 rounded-sm bg-lime" />
                    <span className="h-4 w-1.5 -skew-x-12 rounded-sm bg-lime" />
                  </span>
                  <span className="font-display text-lg font-bold">CustomerIQ</span>
                </div>
                <p className="mt-4 max-w-xs text-[13px] font-medium leading-relaxed text-white/45">
                  Proactive retention intelligence for financial institutions. Score risk, score
                  value, assign the save.
                </p>
                <a
                  href="mailto:hello@customeriq.local"
                  className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-lime hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  hello@customeriq.local
                </a>
              </div>

              <div>
                <p className="font-display text-[13px] font-bold uppercase tracking-wider text-white/40">
                  Product
                </p>
                <ul className="mt-4 space-y-2.5 text-[13px] font-medium text-white/60">
                  <li>
                    <button type="button" className="hover:text-lime" onClick={() => scrollTo('how')}>
                      How it works
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => scrollTo('features')}
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => scrollTo('queue')}
                    >
                      Risk queue
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => navigate('/dashboard/ingestion')}
                    >
                      Data ingestion
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-display text-[13px] font-bold uppercase tracking-wider text-white/40">
                  Access
                </p>
                <ul className="mt-4 space-y-2.5 text-[13px] font-medium text-white/60">
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => navigate('/login')}
                    >
                      Manager login
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => navigate('/register')}
                    >
                      Register branch
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:text-lime"
                      onClick={() => navigate('/ingest-wizard')}
                    >
                      Ingest wizard
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-display text-[13px] font-bold uppercase tracking-wider text-white/40">
                  Platform
                </p>
                <ul className="mt-4 space-y-2.5 text-[13px] font-medium text-white/60">
                  <li>React dashboard</li>
                  <li>Express API and Prisma</li>
                  <li>PostgreSQL</li>
                  <li>FastAPI churn model</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-8 py-5 text-[12px] font-medium text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-12">
              <span>© {new Date().getFullYear()} CustomerIQ. All rights reserved.</span>
              <span>Retention intelligence for banks</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
