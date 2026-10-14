interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function SkeletonTableRows({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  );
}
