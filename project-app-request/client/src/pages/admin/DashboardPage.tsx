import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  ClipboardList,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { fetchDashboardStats } from '../../api/dashboard';
import { DashboardStats } from '../../types';
import { formatCurrencyPHP } from '../../utils/format';
import { formatMonthLabel } from '../../utils/format';
import { getErrorMessage } from '../../api/client';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

interface SummaryCardDef {
  label: string;
  value: string;
  icon: typeof ClipboardList;
  iconClass: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load dashboard data.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <ErrorState title="Could not load dashboard" message={error ?? undefined} />
      </Card>
    );
  }

  const summaryCards: SummaryCardDef[] = [
    {
      label: 'Total Requests',
      value: String(stats.totalRequests),
      icon: ClipboardList,
      iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      label: 'Pending Requests',
      value: String(stats.pendingRequests),
      icon: Clock,
      iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      label: 'In Progress',
      value: String(stats.inProgressRequests),
      icon: Loader,
      iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      label: 'Completed',
      value: String(stats.completedRequests),
      icon: CheckCircle2,
      iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      label: 'Rejected',
      value: String(stats.rejectedRequests),
      icon: XCircle,
      iconClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
    {
      label: 'Total Proposed Value',
      value: formatCurrencyPHP(stats.totalProposedValue),
      icon: TrendingUp,
      iconClass: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    },
    {
      label: 'Total Amount Paid',
      value: formatCurrencyPHP(stats.totalAmountPaid),
      icon: Wallet,
      iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      label: 'Outstanding Amount',
      value: formatCurrencyPHP(stats.outstandingAmount),
      icon: AlertTriangle,
      iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

  const statusData = Object.entries(stats.requestsByStatus).map(([status, count]) => ({
    status,
    count,
  }));

  const categoryData = Object.entries(stats.requestsByCategory).map(([category, count]) => ({
    category,
    count,
  }));

  const monthlyPaidData = stats.monthlyAmountPaid.map((m) => ({
    month: formatMonthLabel(m.month),
    amountPaid: m.amountPaid,
  }));

  const proposedVsPaidData = stats.proposedVsPaid.map((p) => ({
    month: formatMonthLabel(p.month),
    proposed: p.proposed,
    paid: p.paid,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of all submitted project requests.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${card.iconClass}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="truncate text-lg font-bold text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue note */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> "Total Amount Paid" and "Revenue by Category" below reflect revenue
          received from completed projects, not accounting profit. Expenses are not tracked in this
          application.
        </p>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Requests by Status
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Requests by Category
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.category}: ${entry.count}`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Monthly Amount Paid
          </h3>
          {monthlyPaidData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No completed payments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyPaidData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrencyPHP(value)} />
                <Line type="monotone" dataKey="amountPaid" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Proposed Amount vs Amount Paid
          </h3>
          {proposedVsPaidData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={proposedVsPaidData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrencyPHP(value)} />
                <Legend />
                <Bar dataKey="proposed" name="Proposed" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Paid" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
