import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './AdminFormModal.css';

const WHATSAPP_STORAGE_KEY = 'admin_whatsapp_number';

const defaultSignDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

export default function ApprovePaymentModal({ onClose, onApprove }) {
  const [form, setForm] = useState({
    approvalMessage: "Thank you for your payment! We're excited to welcome you.",
    whatsappNumber: '',
    contractRequirements: '',
    contractSignDate: defaultSignDate(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WHATSAPP_STORAGE_KEY);
      if (saved) setForm((f) => ({ ...f, whatsappNumber: saved }));
    } catch {
      // private browsing / storage disabled — just skip the prefill
    }
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      try {
        localStorage.setItem(WHATSAPP_STORAGE_KEY, form.whatsappNumber);
      } catch {
        // ignore
      }
      await onApprove(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-apt-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-apt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-apt-modal__head">
          <h3>Approve Payment</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-apt-modal__field">
            <label>Thank You Message</label>
            <textarea
              className="admin-textarea"
              rows="3"
              required
              value={form.approvalMessage}
              onChange={update('approvalMessage')}
            />
          </div>

          <div className="admin-apt-modal__field">
            <label>WhatsApp Number (for the guest to chat about the contract)</label>
            <input
              className="admin-input"
              type="tel"
              value={form.whatsappNumber}
              onChange={update('whatsappNumber')}
              placeholder="e.g. +250788123456"
            />
          </div>

          <div className="admin-apt-modal__field">
            <label>What to Bring to Sign the Contract</label>
            <textarea
              className="admin-textarea"
              rows="3"
              value={form.contractRequirements}
              onChange={update('contractRequirements')}
              placeholder="e.g. Valid ID and first month's rent in cash"
            />
          </div>

          <div className="admin-apt-modal__field">
            <label>Contract Signature Deadline</label>
            <input
              className="admin-input"
              type="date"
              required
              value={form.contractSignDate}
              onChange={update('contractSignDate')}
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <div className="admin-apt-modal__actions">
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Approve & Email Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
