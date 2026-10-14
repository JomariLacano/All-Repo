import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SuccessModalProps {
  isOpen: boolean;
  referenceNumber: string;
  onClose: () => void;
}

export function SuccessModal({ isOpen, referenceNumber, onClose }: SuccessModalProps) {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Request Sent"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
          <CheckCircle2 size={32} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Thank you! Your project request has been submitted successfully. Please wait for a message
          or call confirming your request so we can discuss the project details.
        </p>
        <div className="w-full rounded-lg bg-slate-100 px-4 py-3 dark:bg-slate-800">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Reference Number
          </p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-slate-900 dark:text-white">
            {referenceNumber}
          </p>
        </div>
      </div>
    </Modal>
  );
}
