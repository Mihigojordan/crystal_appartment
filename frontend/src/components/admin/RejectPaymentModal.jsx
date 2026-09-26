import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './AdminFormModal.css';

export default function RejectPaymentModal({ onClose, onReject }) {
  const [form, setForm] = useState({ rejectionReason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onReject(form);
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
          <h3>Reject Payment</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-apt-modal__field">
            <label>Reason (sent to the guest)</label>
            <textarea
              className="admin-textarea"
              rows="4"
              required
              value={form.rejectionReason}
              onChange={update('rejectionReason')}
              placeholder="e.g. We couldn't match this payment to your reservation — please resend a clearer screenshot."
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <div className="admin-apt-modal__actions">
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-danger" disabled={submitting}>
              {submitting ? 'Sending…' : 'Reject & Notify Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
