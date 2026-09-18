import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import './Apartments.css';

const STATUSES = ['Active', 'Former'];
const PAYMENT_STATUSES = ['Paid', 'Due', 'Overdue'];

export default function Tenants() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const load = () => {
    setLoading(true);
    apiFetch('/tenants')
      .then(setTenants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      total: tenants.length,
      active: tenants.filter((t) => t.status === 'Active').length,
      due: tenants.filter((t) => t.paymentStatus === 'Due').length,
      overdue: tenants.filter((t) => t.paymentStatus === 'Overdue').length,
    }),
    [tenants],
  );

  const rows = useMemo(() => {
    let list = tenants;
    if (statusFilter !== 'All') list = list.filter((t) => t.status === statusFilter);
    if (paymentFilter !== 'All') list = list.filter((t) => t.paymentStatus === paymentFilter);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [tenants, statusFilter, paymentFilter]);

  const handleDelete = async (tenant) => {
    if (!confirm(`Delete "${tenant.name}"?`)) return;
    await apiFetch(`/tenants/${tenant.id}`, { method: 'DELETE' });
    load();
  };

  const paymentBadgeClass = (status) =>
    status === 'Paid' ? 'admin-badge-success' : status === 'Overdue' ? 'admin-badge-warning' : 'admin-badge-muted';

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'unit', header: 'Unit', value: (r) => r.apartmentName ?? '—' },
    {
      key: 'contact',
      header: 'Contact',
      value: (r) => [r.email, r.phone].filter(Boolean).join(' · ') || '—',
    },
    { key: 'leaseEnd', header: 'Lease End', value: (r) => r.leaseEnd ?? '—' },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (r) => <span className={`admin-badge ${paymentBadgeClass(r.paymentStatus)}`}>{r.paymentStatus}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <div className="admin-apartments__row-actions">
          <button type="button" onClick={() => navigate(`/admin/tenants/${r.id}/edit`)} aria-label="Edit">
            <FaEdit />
          </button>
          <button type="button" onClick={() => handleDelete(r)} aria-label="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-apartments">
      <div className="admin-apartments__head">
        <h2>Tenants</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/tenants/new')}>
          <FaPlus /> Add Tenant
        </button>
      </div>
      <p className="admin-text-muted">Resident directory — contact info, unit, lease, payment status</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Tenants" value={stats.total} />
        <StatCard label="Active" value={stats.active} accent />
        <StatCard label="Payment Due" value={stats.due} />
        <StatCard label="Overdue" value={stats.overdue} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No tenants yet — add one to get started.'}
        filters={
          <>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', ...STATUSES].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="admin-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              {['All', ...PAYMENT_STATUSES].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}
