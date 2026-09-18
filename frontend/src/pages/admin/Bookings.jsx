import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import './Bookings.css';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'];

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const load = () => {
    setLoading(true);
    apiFetch('/bookings')
      .then((all) => setBookings(all.filter((b) => b.type !== 'tour')))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'Confirmed').length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    }),
    [bookings],
  );

  const rows = useMemo(
    () => (statusFilter === 'All' ? bookings : bookings.filter((b) => b.status === statusFilter)),
    [bookings, statusFilter],
  );

  const handleStatusChange = async (booking, status) => {
    await apiFetch(`/bookings/${booking.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  const columns = [
    { key: 'guestName', header: 'Guest', value: (r) => r.guestName },
    { key: 'apartmentTitle', header: 'Unit' },
    { key: 'createdAt', header: 'Date', value: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <select
          className="admin-select admin-bookings__status-select"
          value={r.status}
          onChange={(e) => handleStatusChange(r, e.target.value)}
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
        <div className="admin-bookings__row-actions">
          <button type="button" onClick={() => navigate(`/admin/bookings/${r.id}`)} aria-label="View booking">
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-bookings">
      <h2>Bookings</h2>
      <p className="admin-text-muted">Direct bookings from the public site</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="Confirmed" value={stats.confirmed} accent />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Cancelled" value={stats.cancelled} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No bookings yet.'}
        filters={
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', ...STATUSES].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}
