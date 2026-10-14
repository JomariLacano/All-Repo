import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface PingConfirmModalProps {
  isOpen: boolean;
  isSending: boolean;
  onConfirm: (message: string) => void;
  onCancel: () => void;
}

const MESSAGE_MAX_LENGTH = 500;

export function PingConfirmModal({ isOpen, isSending, onConfirm, onCancel }: PingConfirmModalProps) {
  const [message, setMessage] = useState('');

  function handleConfirm() {
    onConfirm(message.trim());
  }

  function handleCancel() {
    setMessage('');
    onCancel();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Send a Follow-up?"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} isLoading={isSending} disabled={isSending}>
            Send Follow-up
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="shrink-0 rounded-full bg-brand-100 p-2 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <MessageCircle size={20} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will notify Jomari Lacano that you are following up on your project request.
          </p>
        </div>

        <Textarea
          label="Optional message"
          rows={3}
          placeholder="e.g. I would like to ask for an update."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MESSAGE_MAX_LENGTH}
          showCounter
          disabled={isSending}
        />
      </div>
    </Modal>
  );
}
