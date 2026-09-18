import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import './ApartmentForm.css';

const PAYMENT_STATUSES = ['Paid', 'Due', 'Overdue'];
const STATUSES = ['Active', 'Former'];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  apartmentId: '',
  leaseStart: '',
  leaseEnd: '',
  paymentStatus: 'Due',
  status: 'Active',
  notes: '',
};

export default function TenantForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/apartments').then(setApartments).catch(() => setApartments([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/tenants/${id}`)
      .then((t) =>
        setForm({
          name: t.name ?? '',
          email: t.email ?? '',
          phone: t.phone ?? '',
          apartmentId: t.apartmentId ?? '',
          leaseStart: t.leaseStart ?? '',
          leaseEnd: t.leaseEnd ?? '',
          paymentStatus: t.paymentStatus ?? 'Due',
          status: t.status ?? 'Active',
          notes: t.notes ?? '',
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const apartment = apartments.find((a) => a.id === form.apartmentId);
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        apartmentId: form.apartmentId || undefined,
        apartmentName: apartment?.name ?? undefined,
        leaseStart: form.leaseStart || undefined,
        leaseEnd: form.leaseEnd || undefined,
        paymentStatus: form.paymentStatus,
        status: form.status,
        notes: form.notes || undefined,
      };
      if (isEdit) {
        await apiFetch(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/tenants', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/admin/tenants');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-empty-state">Loading…</p>;

  return (
    <div className="admin-apt-form">
      <div className="admin-apt-form__head">
        <button type="button" className="admin-btn admin-btn-outline" onClick={() => navigate('/admin/tenants')}>
          <FaArrowLeft /> Back
        </button>
        <h2>{isEdit ? 'Edit Tenant' : 'Add Tenant'}</h2>
        <button type="submit" form="tenant-form" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Tenant'}
        </button>
      </div>

      {error && <p className="admin-login__error">{error}</p>}

      <form id="tenant-form" onSubmit={handleSubmit} className="admin-apt-form__body">
        <section className="admin-card admin-apt-form__section">
          <h3>Basic Information</h3>
          <div className="admin-apt-form__row">
            <div className="admin-apt-form__field">
              <label>Full Name</label>
              <input className="admin-input" required value={form.name} onChange={update('name')} />
            </div>
            <div className="admin-apt-form__field">
              <label>Email</label>
              <input className="admin-input" type="email" value={form.email} onChange={update('email')} placeholder="tenant@example.com" />
            </div>
          </div>
          <div className="admin-apt-form__row">
            <div className="admin-apt-form__field">
              <label>Phone</label>
              <input className="admin-input" value={form.phone} onChange={update('phone')} placeholder="Phone number" />
            </div>
            <div className="admin-apt-form__field">
              <label>Tenant Status</label>
              <select className="admin-select" value={form.status} onChange={update('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section">
          <h3>Unit &amp; Lease</h3>
          <div className="admin-apt-form__row">
            <div className="admin-apt-form__field">
              <label>Unit</label>
              <select className="admin-select" value={form.apartmentId} onChange={update('apartmentId')}>
                <option value="">— Unassigned —</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Payment Status</label>
              <select className="admin-select" value={form.paymentStatus} onChange={update('paymentStatus')}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-apt-form__row">
            <div className="admin-apt-form__field">
              <label>Lease Start</label>
              <input className="admin-input" type="date" value={form.leaseStart} onChange={update('leaseStart')} />
            </div>
            <div className="admin-apt-form__field">
              <label>Lease End</label>
              <input className="admin-input" type="date" value={form.leaseEnd} onChange={update('leaseEnd')} />
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section">
          <h3>Notes</h3>
          <textarea
            className="admin-textarea"
            rows="4"
            value={form.notes}
            onChange={update('notes')}
            placeholder="Anything worth noting about this tenant…"
          />
        </section>
      </form>
    </div>
  );
}
