import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTrash, FaEye, FaTimes, FaCheck, FaBan, FaAdjust } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import PaymentFormModal from '../../components/admin/PaymentFormModal';
import ApprovePaymentModal from '../../components/admin/ApprovePaymentModal';
import './Apartments.css';

const STATUSES = ['Paid', 'Pending', 'Partial', 'Failed'];
const METHODS = ['Cash', 'Card', 'Bank Transfer', 'MoMo', 'Airtel', 'Other'];
const RWF_METHODS = ['MoMo', 'Airtel'];

const currency = (n) => `$${n.toLocaleString()}`;
const formatAmount = (p) => (RWF_METHODS.includes(p.method) ? `RWF ${p.amount.toLocaleString()}` : currency(p.amount));

const badgeClass = (status) =>
  status === 'Paid' ? 'admin-badge-success'
    : status === 'Partial' ? 'admin-badge-warning'
    : status === 'Failed' ? 'admin-badge-danger'
    : 'admin-badge-muted';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [approving, setApproving] = useState(null);

  const load = () => {
    setLoading(true);
    apiFetch('/payments')
      .then(setPayments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const now = new Date();
    // Mobile money rows are RWF-denominated — kept out of these USD totals
    // so the sums don't mix currencies. See the "Mobile Money Pending" card.
    const usdRows = payments.filter((p) => !RWF_METHODS.includes(p.method));
    const paid = usdRows.filter((p) => p.status === 'Paid');
    const thisMonth = paid.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
      totalCollected: paid.reduce((sum, p) => sum + p.amount, 0),
      collectedThisMonth: thisMonth.reduce((sum, p) => sum + p.amount, 0),
      pending: usdRows.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
      count: payments.length,
      mobileMoneyPending: payments.filter((p) => RWF_METHODS.includes(p.method) && ['Pending', 'Partial'].includes(p.status)).length,
    };
  }, [payments]);

  const rows = useMemo(() => {
    let list = payments;
    if (statusFilter !== 'All') list = list.filter((p) => p.status === statusFilter);
    if (methodFilter !== 'All') list = list.filter((p) => p.method === methodFilter);
    return list;
  }, [payments, statusFilter, methodFilter]);

  const handleDelete = async (payment) => {
    if (!confirm(`Delete this ${formatAmount(payment)} payment?`)) return;
    await apiFetch(`/payments/${payment.id}`, { method: 'DELETE' });
    if (viewing?.id === payment.id) setViewing(null);
    load();
  };

  // Status corrections stay available regardless of current status — an
  // admin can re-approve/undo a wrong click at any time.
  const updateStatus = async (payment, status, extra) => {
    const updated = await apiFetch(`/payments/${payment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    });
    setPayments((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    if (viewing?.id === payment.id) setViewing(updated);
    return updated;
  };

  const handleApproveSubmit = async (form) => {
    await updateStatus(approving, 'Paid', form);
  };

  const columns = [
    { key: 'date', header: 'Date' },
    { key: 'tenantName', header: 'Tenant', value: (r) => r.tenantName ?? '—' },
    { key: 'apartmentName', header: 'Unit', value: (r) => r.apartmentName ?? '—' },
    { key: 'amount', header: 'Amount', value: (r) => formatAmount(r) },
    { key: 'method', header: 'Method' },
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
          <button type="button" onClick={() => setViewing(r)} aria-label="View payment">
            <FaEye />
          </button>
          <button type="button" onClick={() => setApproving(r)} aria-label="Approve payment">
            <FaCheck />
          </button>
          <button type="button" onClick={() => updateStatus(r, 'Partial')} aria-label="Mark partial">
            <FaAdjust />
          </button>
          <button type="button" onClick={() => updateStatus(r, 'Failed')} aria-label="Reject payment">
            <FaBan />
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
        <h2>Payments</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> Record Payment
        </button>
      </div>
      <p className="admin-text-muted">Rent payment ledger across all tenants</p>

      <div className="admin-stat-grid">
        <StatCard label="Total Collected" value={currency(stats.totalCollected)} accent />
        <StatCard label="Collected This Month" value={currency(stats.collectedThisMonth)} />
        <StatCard label="Pending" value={currency(stats.pending)} />
        <StatCard label="Total Payments" value={stats.count} />
        <StatCard label="Mobile Money Awaiting Review" value={stats.mobileMoneyPending} />
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      <DataTable
        columns={columns}
        rows={loading ? [] : rows}
        emptyMessage={loading ? 'Loading…' : 'No payments recorded yet.'}
        filters={
          <>
            <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', ...STATUSES].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="admin-select" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              {['All', ...METHODS].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </>
        }
      />

      {showForm && (
        <PaymentFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {approving && (
        <ApprovePaymentModal
          onClose={() => setApproving(null)}
          onApprove={handleApproveSubmit}
        />
      )}

      {viewing && (
        <div className="admin-payments__overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal admin-payments__view" onClick={(e) => e.stopPropagation()}>
            <div className="admin-payments__view-head">
              <h3>Payment Detail</h3>
              <button type="button" className="admin-payments__close" aria-label="Close" onClick={() => setViewing(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-payments__view-meta">
              <span className={`admin-badge ${badgeClass(viewing.status)}`}>{viewing.status}</span>
              <span>{viewing.date}</span>
            </div>

            <dl className="admin-payments__view-fields">
              <dt>Amount</dt>
              <dd>{formatAmount(viewing)}</dd>
              <dt>Tenant</dt>
              <dd>{viewing.tenantName ?? '—'}</dd>
              <dt>Unit</dt>
              <dd>{viewing.apartmentName ?? '—'}</dd>
              <dt>Method</dt>
              <dd>{viewing.method}</dd>
              {viewing.guestPhone && (
                <>
                  <dt>Phone Used to Pay</dt>
                  <dd>{viewing.guestPhone}</dd>
                </>
              )}
              {viewing.contractSignDate && (
                <>
                  <dt>Contract Sign-by Date</dt>
                  <dd>{viewing.contractSignDate}</dd>
                </>
              )}
              {viewing.whatsappNumber && (
                <>
                  <dt>WhatsApp Shared</dt>
                  <dd>{viewing.whatsappNumber}</dd>
                </>
              )}
            </dl>

            {viewing.contractRequirements && (
              <div className="admin-payments__field">
                <label>What to Bring (sent to guest)</label>
                <p className="admin-text-muted">{viewing.contractRequirements}</p>
              </div>
            )}

            {viewing.screenshotUrl && (
              <div className="admin-payments__proof">
                <div className="admin-payments__proof-head">
                  <span>Screenshot Proof</span>
                  <span className={`admin-badge ${viewing.matched ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                    {viewing.matched ? 'Matched on submit' : 'Did not match on submit'}
                  </span>
                </div>
                <a href={viewing.screenshotUrl} target="_blank" rel="noreferrer">
                  <img src={viewing.screenshotUrl} alt="Payment screenshot" />
                </a>
                <dl className="admin-payments__view-fields">
                  <dt>Extracted Amount</dt>
                  <dd>{viewing.extractedAmount != null ? `RWF ${viewing.extractedAmount.toLocaleString()}` : '—'}</dd>
                  <dt>Extracted Date</dt>
                  <dd>{viewing.extractedDate ?? '—'}</dd>
                </dl>
              </div>
            )}

            <div className="admin-payments__view-actions">
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => setApproving(viewing)}>
                <FaCheck /> Approve
              </button>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => updateStatus(viewing, 'Partial')}>
                <FaAdjust /> Mark Partial
              </button>
              <button type="button" className="admin-btn admin-btn-outline" onClick={() => updateStatus(viewing, 'Failed')}>
                <FaBan /> Reject
              </button>
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
