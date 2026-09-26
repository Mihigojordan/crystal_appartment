import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import './AdminFormModal.css';

const METHODS = ['Cash', 'Card', 'Bank Transfer', 'MoMo', 'Airtel', 'Other'];
const STATUSES = ['Paid', 'Pending', 'Failed'];

export default function PaymentFormModal({ onClose, onSaved }) {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({
    tenantId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    method: 'Cash',
    status: 'Paid',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/tenants').then(setTenants).catch(() => setTenants([]));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const tenant = tenants.find((t) => t.id === form.tenantId);
      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: form.tenantId || undefined,
          tenantName: tenant?.name ?? undefined,
          apartmentId: tenant?.apartmentId ?? undefined,
          apartmentName: tenant?.apartmentName ?? undefined,
          amount: Number(form.amount) || 0,
          date: form.date,
          method: form.method,
          status: form.status,
          notes: form.notes || undefined,
        }),
      });
      onSaved();
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
          <h3>Record Payment</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-apt-modal__field">
            <label>Tenant</label>
            <select className="admin-select" value={form.tenantId} onChange={update('tenantId')}>
              <option value="">— Unassigned —</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-apt-modal__row">
            <div className="admin-apt-modal__field">
              <label>Amount ($)</label>
              <input className="admin-input" type="number" min="0" required value={form.amount} onChange={update('amount')} />
            </div>
            <div className="admin-apt-modal__field">
              <label>Date</label>
              <input className="admin-input" type="date" required value={form.date} onChange={update('date')} />
            </div>
          </div>

          <div className="admin-apt-modal__row">
            <div className="admin-apt-modal__field">
              <label>Method</label>
              <select className="admin-select" value={form.method} onChange={update('method')}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-modal__field">
              <label>Status</label>
              <select className="admin-select" value={form.status} onChange={update('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-apt-modal__field">
            <label>Notes</label>
            <input className="admin-input" value={form.notes} onChange={update('notes')} placeholder="Optional" />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <div className="admin-apt-modal__actions">
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
