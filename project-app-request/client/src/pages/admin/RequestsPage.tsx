import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTableRows } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { RequestDetailsDrawer } from '../../components/admin/RequestDetailsDrawer';
import { fetchAdminRequests } from '../../api/adminRequests';
import { getErrorMessage } from '../../api/client';
import { ProjectRequest, RequestCategory, RequestStatus } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrencyPHP, formatDate } from '../../utils/format';
import { statusBadgeClasses, STATUS_OPTIONS, CATEGORY_OPTIONS } from '../../utils/statusHelpers';

const PAGE_SIZE = 10;

export function RequestsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState<RequestStatus | ''>('');
  const [category, setCategory] = useState<RequestCategory | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'initialProposedAmount'>('createdAt');
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
  }, [debouncedSearch, status, category, sortBy, sortOrder, page]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, sortBy, sortOrder]);

  function toggleSort(field: 'createdAt' | 'initialProposedAmount') {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => toggleSort('createdAt')}
              className="flex-1"
            >
              <ArrowUpDown size={14} className="mr-1.5" />
              Date {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => toggleSort('initialProposedAmount')}
              className="flex-1"
            >
              <ArrowUpDown size={14} className="mr-1.5" />
              Amount {sortBy === 'initialProposedAmount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <Th>Reference Number</Th>
                <Th>Client Name</Th>
                <Th>Project Title</Th>
                <Th>Category</Th>
                <Th>Proposed Amount</Th>
                <Th>Status</Th>
                <Th>Date Submitted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading && <SkeletonTableRows rows={6} columns={8} />}

              {!isLoading &&
                !error &&
                items.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {req.referenceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{req.fullName}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-700 dark:text-slate-300">
                      {req.projectTitle}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {req.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {formatCurrencyPHP(req.initialProposedAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={statusBadgeClasses(req.status)}>{req.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
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
