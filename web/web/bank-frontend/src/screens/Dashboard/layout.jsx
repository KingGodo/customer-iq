import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Database,
  ShieldCheck,
  Menu,
  X,
  Search,
  Megaphone,
  SlidersHorizontal,
  BarChart3,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', path: '/dashboard/customers', icon: Users },
  { name: 'Retention', path: '/dashboard/retention', icon: ShieldCheck },
  { name: 'Communications', path: '/dashboard/communications', icon: Megaphone },
  { name: 'Batch', path: '/dashboard/batch', icon: Settings },
  { name: 'Ingestion', path: '/dashboard/ingestion', icon: Database },
  { name: 'Rules', path: '/dashboard/rules', icon: SlidersHorizontal },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  const NavLinks = ({ onNavigate }) => (
    <nav className="flex flex-1 flex-col gap-0.5">
      {SIDEBAR_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] font-medium transition-colors',
              active
                ? 'bg-white/10 text-lime'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-black font-sans text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] px-3 py-3 lg:flex">
        <Link to="/dashboard" className="mb-4 flex items-center gap-2.5 px-2.5 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-lime">
            <span className="flex gap-0.5">
              <span className="h-3 w-0.5 -skew-x-12 rounded-[1px] bg-black" />
              <span className="h-3 w-0.5 -skew-x-12 rounded-[1px] bg-black" />
            </span>
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-white">
            CustomerIQ
          </span>
        </Link>

        <NavLinks />

        <div className="mt-auto flex flex-col gap-0.5 border-t border-white/10 pt-2">
          <button
            type="button"
            className="flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            Help
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded px-2.5 py-2 text-[13px] font-medium text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-56 flex-col border-r border-white/10 bg-[#0a0a0a] p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="font-display text-sm font-semibold text-white">CustomerIQ</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="mt-auto border-t border-white/10 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-[13px] font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0a0a0a] px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="hidden text-[13px] font-medium text-white/40 sm:inline lg:hidden">
              CustomerIQ
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="ml-1 flex items-center gap-2 border-l border-white/10 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-semibold leading-none text-white">
                  {user?.first_name || 'Admin'} {user?.last_name || ''}
                </p>
                <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-white/40">
                  {user?.email || user?.bank_name}
                </p>
              </div>
              <Avatar className="h-7 w-7 rounded border border-white/15">
                <AvatarFallback className="rounded bg-lime text-[11px] font-semibold text-black">
                  {(user?.first_name || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black px-3 py-3 sm:px-4 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
