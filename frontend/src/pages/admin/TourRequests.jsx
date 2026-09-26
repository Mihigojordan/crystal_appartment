import { useEffect, useMemo, useState } from 'react';
import { FaEye, FaTimes, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import './TourRequests.css';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

const badgeClass = (status) =>
  status === 'Confirmed' ? 'admin-badge-success' : status === 'Cancelled' ? 'admin-badge-muted' : 'admin-badge-warning';

export default function TourRequests() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewing, setViewing] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch('/bookings')
      .then((all) => setTours(all.filter((b) => b.type === 'tour')))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      total: tours.length,
      pending: tours.filter((t) => t.status === 'Pending').length,
      confirmed: tours.filter((t) => t.status === 'Confirmed').length,
      cancelled: tours.filter((t) => t.status === 'Cancelled').length,
    }),
    [tours],
  );

  const rows = useMemo(
    () => (statusFilter === 'All' ? tours : tours.filter((t) => t.status === statusFilter)),
    [tours, statusFilter],
  );

  const updateStatus = async (tour, status) => {
    const updated = await apiFetch(`/bookings/${tour.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setTours((list) => list.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  };

  const handleDelete = async (tour) => {
    if (!confirm(`Delete the tour request from ${tour.guestName}?`)) return;
    await apiFetch(`/bookings/${tour.id}`, { method: 'DELETE' });
    if (viewing?.id === tour.id) setViewing(null);
    load();
  };

  const columns = [
    { key: 'guestName', header: 'Guest', value: (r) => r.guestName },
    { key: 'guestPhone', header: 'Phone', value: (r) => r.guestPhone || '—' },
    { key: 'apartmentTitle', header: 'Unit', value: (r) => r.apartmentTitle },
    { key: 'tourDate', header: 'Tour Date', value: (r) => r.tourDate || '—' },
    { key: 'tourTime', header: 'Tour Time', value: (r) => r.tourTime || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <select
          className="admin-select admin-tours__status-select"
          value={r.status}
          onChange={(e) => updateStatus(r, e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
      value: (r) => r.status,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <div className="admin-tours__row-actions">
          <button type="button" onClick={() => setViewing(r)} aria-label="View tour request">
            <FaEye />
          </button>
          <button type="button" onClick={() => handleDelete(r)} aria-label="Delete tour request">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-tours">
      <h2>Tour Requests</h2>
      <p className="admin-text-muted">People who want to tour an apartment before booking</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Requests" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} accent />
        <StatCard label="Confirmed" value={stats.confirmed} />
        <StatCard label="Cancelled" value={stats.cancelled} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No tour requests yet.'}
        filters={
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', ...STATUSES].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />

      {viewing && (
        <div className="admin-tours__overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal admin-tours__view" onClick={(e) => e.stopPropagation()}>
            <div className="admin-tours__view-head">
              <h3>{viewing.guestName}</h3>
              <button type="button" className="admin-tours__close" aria-label="Close" onClick={() => setViewing(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-tours__view-meta">
              <span className={`admin-badge ${badgeClass(viewing.status)}`}>{viewing.status}</span>
              <span>Requested {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</span>
            </div>

            <dl className="admin-tours__view-fields">
              <dt>Email</dt>
              <dd>{viewing.guestEmail}</dd>
              <dt>Phone</dt>
              <dd>{viewing.guestPhone || '—'}</dd>
              <dt>Apartment</dt>
              <dd>{viewing.apartmentTitle}</dd>
              <dt>Tour Date</dt>
              <dd>{viewing.tourDate || '—'}</dd>
              <dt>Tour Time</dt>
              <dd>{viewing.tourTime || '—'}</dd>
              <dt>Desired Move-in</dt>
              <dd>{viewing.moveIn || '—'}</dd>
            </dl>

            {viewing.notes && (
              <div>
                <span className="admin-tours__notes-label">Notes</span>
                <p className="admin-tours__view-body">{viewing.notes}</p>
              </div>
            )}

            <div className="admin-tours__view-actions">
              {viewing.status !== 'Confirmed' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={async () => setViewing(await updateStatus(viewing, 'Confirmed'))}
                >
                  Confirm
                </button>
              )}
              {viewing.status !== 'Cancelled' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={async () => setViewing(await updateStatus(viewing, 'Cancelled'))}
                >
                  Cancel
                </button>
              )}
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => handleDelete(viewing)}>
                <FaTrash /> Delete
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
