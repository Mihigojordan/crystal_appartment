import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import './Apartments.css';

export default function Apartments() {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const load = () => {
    setLoading(true);
    apiFetch('/apartments')
      .then(setApartments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      total: apartments.length,
      occupied: apartments.filter((a) => a.status === 'Occupied').length,
      vacant: apartments.filter((a) => a.status === 'Vacant').length,
      maintenance: apartments.filter((a) => a.status === 'Maintenance').length,
    }),
    [apartments],
  );

  const rows = useMemo(() => {
    let list = apartments;
    if (statusFilter !== 'All') list = list.filter((a) => a.status === statusFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === 'rent') return b.rent - a.rent;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [apartments, statusFilter, sortBy]);

  const handleDelete = async (apartment) => {
    if (!confirm(`Delete "${apartment.name}"?`)) return;
    await apiFetch(`/apartments/${apartment.id}`, { method: 'DELETE' });
    load();
  };

  const badgeClass = (status) =>
    status === 'Occupied' ? 'admin-badge-success' : status === 'Maintenance' ? 'admin-badge-warning' : 'admin-badge-muted';

  const columns = [
    { key: 'name', header: 'Unit Name' },
    { key: 'tenant', header: 'Tenant', value: (r) => r.tenant ?? '—' },
    { key: 'rent', header: 'Rent', value: (r) => `$${r.rent.toLocaleString()}` },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <span className={`admin-badge ${badgeClass(r.status)}`}>{r.status}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <div className="admin-apartments__row-actions">
          <button type="button" onClick={() => navigate(`/admin/apartments/${r.id}`)} aria-label="View">
            <FaEye />
          </button>
          <button type="button" onClick={() => navigate(`/admin/apartments/${r.id}/edit`)} aria-label="Edit">
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
        <h2>Apartment Management</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/apartments/new')}>
          <FaPlus /> Add Apartment
        </button>
      </div>
      <p className="admin-text-muted">View and manage all units</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Units" value={stats.total} />
        <StatCard label="Occupied" value={stats.occupied} accent />
        <StatCard label="Vacant" value={stats.vacant} />
        <StatCard label="Maintenance" value={stats.maintenance} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No apartments yet — add one to get started.'}
        filters={
          <>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', 'Occupied', 'Vacant', 'Maintenance'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="admin-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="rent">Sort: Rent</option>
            </select>
          </>
        }
      />
    </div>
  );
}
