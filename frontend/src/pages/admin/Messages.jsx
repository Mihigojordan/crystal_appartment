import { useEffect, useMemo, useState } from 'react';
import { FaEye, FaEnvelopeOpen, FaArchive, FaTimes, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import './Messages.css';

const STATUSES = ['New', 'Read', 'Archived'];

const badgeClass = (status) =>
  status === 'New' ? 'admin-badge-warning' : status === 'Read' ? 'admin-badge-success' : 'admin-badge-muted';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewing, setViewing] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch('/messages')
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(
    () => ({
      total: messages.length,
      new: messages.filter((m) => m.status === 'New').length,
      read: messages.filter((m) => m.status === 'Read').length,
      archived: messages.filter((m) => m.status === 'Archived').length,
    }),
    [messages],
  );

  const rows = useMemo(
    () => (statusFilter === 'All' ? messages : messages.filter((m) => m.status === statusFilter)),
    [messages, statusFilter],
  );

  const updateStatus = async (message, status) => {
    const updated = await apiFetch(`/messages/${message.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setMessages((list) => list.map((m) => (m.id === updated.id ? updated : m)));
    return updated;
  };

  const handleView = async (message) => {
    setViewing(message);
    if (message.status === 'New') {
      try {
        const updated = await updateStatus(message, 'Read');
        setViewing(updated);
      } catch {
        // keep the modal open with the pre-update message on failure
      }
    }
  };

  const handleDelete = async (message) => {
    if (!confirm(`Delete the message from ${message.name}?`)) return;
    await apiFetch(`/messages/${message.id}`, { method: 'DELETE' });
    if (viewing?.id === message.id) setViewing(null);
    setMessages((list) => list.filter((m) => m.id !== message.id));
  };

  const columns = [
    { key: 'name', header: 'Name', value: (r) => r.name },
    { key: 'email', header: 'Email', value: (r) => r.email },
    { key: 'phone', header: 'Phone', value: (r) => r.phone || '—' },
    {
      key: 'message',
      header: 'Message',
      render: (r) => <span className="admin-messages__excerpt">{r.message}</span>,
      value: (r) => r.message,
    },
    { key: 'createdAt', header: 'Date', value: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <span className={`admin-badge ${badgeClass(r.status)}`}>{r.status}</span>,
      value: (r) => r.status,
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <div className="admin-messages__row-actions">
          <button type="button" onClick={() => handleView(r)} aria-label="View message">
            <FaEye />
          </button>
          {r.status !== 'Read' && (
            <button type="button" onClick={() => updateStatus(r, 'Read')} aria-label="Mark as read">
              <FaEnvelopeOpen />
            </button>
          )}
          {r.status !== 'Archived' && (
            <button type="button" onClick={() => updateStatus(r, 'Archived')} aria-label="Archive">
              <FaArchive />
            </button>
          )}
          <button type="button" onClick={() => handleDelete(r)} aria-label="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-messages">
      <h2>Messages</h2>
      <p className="admin-text-muted">Contact form submissions from the public site</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Messages" value={stats.total} />
        <StatCard label="New" value={stats.new} accent />
        <StatCard label="Read" value={stats.read} />
        <StatCard label="Archived" value={stats.archived} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No messages yet.'}
        filters={
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', ...STATUSES].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
      />

      {viewing && (
        <div className="admin-messages__overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal admin-messages__view" onClick={(e) => e.stopPropagation()}>
            <div className="admin-messages__view-head">
              <h3>{viewing.name}</h3>
              <button type="button" className="admin-messages__close" aria-label="Close" onClick={() => setViewing(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-messages__view-meta">
              <span className={`admin-badge ${badgeClass(viewing.status)}`}>{viewing.status}</span>
              <span>{viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</span>
            </div>

            <dl className="admin-messages__view-fields">
              <dt>Email</dt>
              <dd>{viewing.email}</dd>
              <dt>Phone</dt>
              <dd>{viewing.phone || '—'}</dd>
            </dl>

            <p className="admin-messages__view-body">{viewing.message}</p>

            <div className="admin-messages__view-actions">
              {viewing.status !== 'Archived' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={async () => setViewing(await updateStatus(viewing, 'Archived'))}
                >
                  <FaArchive /> Archive
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
