import { useState } from 'react';
import { Modal, Button, Field } from './ui';
import { useLang } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { submitReport } from '../lib/api';

const REASONS = ['behavior', 'contact', 'noshow', 'quality', 'other'] as const;

export function ReportModal({
  open, onClose, reporterId, targetUserId, sessionId,
}: {
  open: boolean;
  onClose: () => void;
  reporterId: string;
  targetUserId?: string;
  sessionId?: string;
}) {
  const { t } = useLang();
  const { toast } = useToast();
  const [reason, setReason] = useState<string>('behavior');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await submitReport({ reporterId, targetUserId, sessionId, reason, details });
      toast(t('rep.sent'));
      onClose();
      setDetails('');
    } catch {
      toast(t('err.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('rep.title')}>
      <p className="text-sm text-ink-500 mb-4">{t('rep.sub')}</p>
      <div className="space-y-4">
        <Field label={t('rep.reason')} htmlFor="rep-reason">
          <select id="rep-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>{t(`rep.reason.${r}` as Parameters<typeof t>[0])}</option>
            ))}
          </select>
        </Field>
        <Field label={t('rep.details')} htmlFor="rep-details">
          <textarea
            id="rep-details"
            className="input min-h-24 resize-y"
            placeholder={t('rep.details.ph')}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={1000}
          />
        </Field>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={submit} loading={busy} disabled={!details.trim()}>
            {t('rep.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
