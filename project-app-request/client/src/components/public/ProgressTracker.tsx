import { Check } from 'lucide-react';
import { RequestStatus } from '../../types';

interface ProgressTrackerProps {
  status: RequestStatus;
}

const STEPS: { key: RequestStatus; label: string }[] = [
  { key: 'Pending', label: 'Submitted' },
  { key: 'Reviewing', label: 'Reviewing' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Done', label: 'Done' },
];

/** Visual step tracker for the happy-path statuses. Rejected is shown separately by the caller. */
export function ProgressTracker({ status }: ProgressTrackerProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  // If the request is Rejected, freeze the tracker at whatever step it had reached.
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, index) => {
        const isComplete = index < activeIndex || (index === activeIndex && status === 'Done');
        const isCurrent = index === activeIndex && status !== 'Done';
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  isComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                }`}
              >
                {isComplete ? <Check size={16} /> : index + 1}
              </span>
              <span
                className={`hidden text-center text-xs font-medium sm:block ${
                  isComplete || isCurrent
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mx-1 h-0.5 flex-1 rounded-full transition-colors sm:mx-2 ${
                  index < activeIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
