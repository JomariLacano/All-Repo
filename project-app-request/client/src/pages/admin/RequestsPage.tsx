import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight, ArrowUpDown, Bell } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTableRows } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { RequestDetailsDrawer } from '../../components/admin/RequestDetailsDrawer';
import { fetchAdminRequestById, fetchAdminRequests, FollowUpFilter } from '../../api/adminRequests';
import { getErrorMessage } from '../../api/client';
import { ProjectRequest, RequestCategory, RequestStatus } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrencyPHP, formatDate } from '../../utils/format';
import { statusBadgeClasses, STATUS_OPTIONS, CATEGORY_OPTIONS } from '../../utils/statusHelpers';

const PAGE_SIZE = 10;

type SortByOption = 'createdAt' | 'updatedAt' | 'initialProposedAmount' | 'lastPingAt' | 'pingCount';

const SORT_OPTIONS: { value: SortByOption; label: string }[] = [
  { value: 'createdAt', label: 'Most Recently Submitted' },
  { value: 'updatedAt', label: 'Most Recently Updated' },
  { value: 'lastPingAt', label: 'Most Recently Pinged' },
  { value: 'pingCount', label: 'Highest Ping Count' },
  { value: 'initialProposedAmount', label: 'Proposed Amount' },
];

const FOLLOW_UP_OPTIONS: { value: FollowUpFilter | ''; label: string }[] = [
  { value: '', label: 'Any Follow-up Status' },
  { value: 'hasFollowUp', label: 'Has Follow-up' },
  { value: 'noFollowUp', label: 'No Follow-up' },
  { value: 'multipleFollowUps', label: 'Multiple Follow-ups' },
];

function pingRowAccent(pingCount: number): string {
  if (pingCount >= 3) return 'border-l-4 border-l-red-400';
  if (pingCount === 2) return 'border-l-4 border-l-amber-400';
  if (pingCount === 1) return 'border-l-4 border-l-blue-400';
  return '';
}

export function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const [category, setCategory] = useState<RequestCategory | ''>('');
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter | ''>('');
  const [sortBy, setSortBy] = useState<SortByOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<ProjectRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAdminRequests({
        search: debouncedSearch || undefined,
        status: status || undefined,
        category: category || undefined,
        followUpFilter: followUpFilter || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load requests.'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, category, followUpFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, followUpFilter, sortBy, sortOrder]);

  // Deep-link support: notifications can navigate to /admin/requests?open=<requestId>
  // to automatically open that request's details drawer.
  useEffect(() => {
    const openId = searchParams.get('open');
    if (!openId) return;

    let cancelled = false;
    (async () => {
      try {
        const { request } = await fetchAdminRequestById(openId);
        if (!cancelled) setSelectedRequest(request);
      } catch {
        // Request may have been deleted; silently ignore.
      } finally {
        if (!cancelled) {
          const next = new URLSearchParams(searchParams);
          next.delete('open');
          setSearchParams(next, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function toggleSortOrder() {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  function handleUpdated(updated: ProjectRequest) {
    setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedRequest(updated);
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    setSelectedRequest(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Requests</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} request{total === 1 ? '' : 's'} found
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name, email, reference, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            placeholder="All statuses"
            value={status}
            onChange={(e) => setStatus(e.target.value as RequestStatus | '')}
            options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
          <Select
            placeholder="All categories"
            value={category}
            onChange={(e) => setCategory(e.target.value as RequestCategory | '')}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value as FollowUpFilter | '')}
            options={FOLLOW_UP_OPTIONS}
          />
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              options={SORT_OPTIONS}
              className="flex-1"
            />
            <Button variant="outline" size="md" onClick={toggleSortOrder} aria-label="Toggle sort direction">
              <ArrowUpDown size={14} />
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <Th>Reference Number</Th>
                <Th>Client Name</Th>
                <Th className="hidden lg:table-cell">Project Title</Th>
                <Th className="hidden md:table-cell">Category</Th>
                <Th className="hidden sm:table-cell">Proposed Amount</Th>
                <Th>Status</Th>
                <Th className="hidden xl:table-cell">Follow-ups</Th>
                <Th className="hidden md:table-cell">Date Submitted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && <SkeletonTableRows rows={6} columns={9} />}

              {!isLoading &&
                !error &&
                items.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${pingRowAccent(req.pingCount)}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {req.referenceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{req.fullName}</td>
                    <td className="hidden max-w-[220px] truncate px-4 py-3 text-slate-700 dark:text-slate-300 lg:table-cell">
                      {req.projectTitle}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 md:table-cell">
                      {req.category}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 sm:table-cell">
                      {formatCurrencyPHP(req.initialProposedAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={statusBadgeClasses(req.status)}>{req.status}</Badge>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 xl:table-cell">
                      {req.pingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Bell size={12} />
                          {req.pingCount}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 md:table-cell">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(req)}>
                        <Eye size={14} className="mr-1.5" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && error && (
            <ErrorState title="Could not load requests" message={error} />
          )}

          {!isLoading && !error && items.length === 0 && (
            <EmptyState
              title="No requests found"
              message="Try adjusting your search or filters, or check back later for new submissions."
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && items.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RequestDetailsDrawer
        request={selectedRequest}
        isOpen={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

function Th({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </th>
  );
}
