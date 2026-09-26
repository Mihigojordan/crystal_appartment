import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaCheck, FaBan, FaAdjust } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import ApprovePaymentModal from '../../components/admin/ApprovePaymentModal';
import './BookingView.css';

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'];
const RWF_METHODS = ['MoMo', 'Airtel'];

const bookingBadgeClass = (status) =>
  status === 'Confirmed' ? 'admin-badge-success' : status === 'Cancelled' ? 'admin-badge-muted' : 'admin-badge-warning';

const paymentBadgeClass = (status) =>
  status === 'Paid' ? 'admin-badge-success'
    : status === 'Partial' ? 'admin-badge-warning'
    : status === 'Failed' ? 'admin-badge-danger'
    : 'admin-badge-muted';

const formatAmount = (p) => (RWF_METHODS.includes(p.method) ? `RWF ${p.amount.toLocaleString()}` : `$${p.amount.toLocaleString()}`);

export default function BookingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);

  const load = () => {
    apiFetch(`/bookings/${id}`)
      .then(setBooking)
      .catch((err) => setError(err.message));
    apiFetch('/payments')
      .then((all) => setPayment(all.find((p) => p.bookingId === id) ?? null))
      .catch(() => setPayment(null));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status) => {
    const updated = await apiFetch(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setBooking(updated);
  };

  const handleDelete = async () => {
    if (!booking || !confirm(`Delete the booking from ${booking.guestName}?`)) return;
    await apiFetch(`/bookings/${id}`, { method: 'DELETE' });
    navigate('/admin/bookings');
  };

  // Status corrections stay available regardless of current status — an
  // admin can re-approve/undo a wrong click at any time. Approving to
  // "Paid" auto-confirms the booking and emails the guest a receipt.
  const handlePaymentStatus = async (status, extra) => {
    const updated = await apiFetch(`/payments/${payment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    });
    setPayment(updated);
    if (status === 'Paid') load();
  };

  const handleApproveSubmit = (form) => handlePaymentStatus('Paid', form);

  if (error) return <p className="admin-empty-state">{error}</p>;
  if (!booking) return <p className="admin-empty-state">Loading…</p>;

  return (
    <div className="admin-booking-view">
      <div className="admin-booking-view__head">
        <button type="button" className="admin-btn admin-btn-outline" onClick={() => navigate('/admin/bookings')}>
          <FaArrowLeft /> Back
        </button>
        <h2>{booking.guestName}</h2>
        <button type="button" className="admin-btn admin-btn-outline" onClick={handleDelete}>
          <FaTrash /> Delete
        </button>
      </div>

      <div className="admin-card admin-booking-view__summary">
        <span className={`admin-badge ${bookingBadgeClass(booking.status)}`}>{booking.status}</span>
        <span className="admin-badge admin-badge-muted">{booking.type === 'tour' ? 'Tour Request' : 'Direct Booking'}</span>
        <span className="admin-text-muted">
          Requested {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '—'}
        </span>
      </div>

      <div className="admin-booking-view__body">
        <section className="admin-card admin-booking-view__section admin-booking-view__section--half">
          <h3>Guest Details</h3>
          <dl className="admin-booking-view__fields">
            <dt>Email</dt>
            <dd>{booking.guestEmail || '—'}</dd>
            <dt>Phone</dt>
            <dd>{booking.guestPhone || '—'}</dd>
            <dt>Apartment</dt>
            <dd>{booking.apartmentTitle || '—'}</dd>
            {booking.type === 'tour' ? (
              <>
                <dt>Tour Date</dt>
                <dd>{booking.tourDate || '—'}</dd>
                <dt>Tour Time</dt>
                <dd>{booking.tourTime || '—'}</dd>
              </>
            ) : (
              <>
                <dt>Move-in Date</dt>
                <dd>{booking.moveIn || '—'}</dd>
              </>
            )}
          </dl>
          {booking.notes && (
            <>
              <h3 className="admin-booking-view__notes-title">Notes</h3>
              <p className="admin-booking-view__text">{booking.notes}</p>
            </>
          )}
        </section>

        <section className="admin-card admin-booking-view__section admin-booking-view__section--half">
          <h3>Booking Status</h3>
          <select
            className="admin-select"
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="admin-booking-view__hint">
            Approving the payment below sets this to Confirmed automatically.
          </p>
        </section>

        {booking.type === 'direct' && (
          <section className="admin-card admin-booking-view__section">
            <h3>Payment</h3>
            {!payment ? (
              <p className="admin-empty-state">No payment proof submitted yet.</p>
            ) : (
              <>
                <div className="admin-booking-view__payment-meta">
                  <span className={`admin-badge ${paymentBadgeClass(payment.status)}`}>{payment.status}</span>
                  <span className={`admin-badge ${payment.matched ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                    {payment.matched ? 'Matched on submit' : 'Did not match on submit'}
                  </span>
                </div>

                <dl className="admin-booking-view__fields">
                  <dt>Method</dt>
                  <dd>{payment.method}</dd>
                  <dt>Amount</dt>
                  <dd>{formatAmount(payment)}</dd>
                  <dt>Phone Used to Pay</dt>
                  <dd>{payment.guestPhone || '—'}</dd>
                  <dt>Date Paid</dt>
                  <dd>{payment.date}</dd>
                  <dt>Extracted Amount</dt>
                  <dd>{payment.extractedAmount != null ? `RWF ${payment.extractedAmount.toLocaleString()}` : '—'}</dd>
                  <dt>Extracted Date</dt>
                  <dd>{payment.extractedDate ?? '—'}</dd>
                  {payment.contractSignDate && (
                    <>
                      <dt>Contract Sign-by Date</dt>
                      <dd>{payment.contractSignDate}</dd>
                    </>
                  )}
                  {payment.whatsappNumber && (
                    <>
                      <dt>WhatsApp Shared</dt>
                      <dd>{payment.whatsappNumber}</dd>
                    </>
                  )}
                </dl>

                {payment.contractRequirements && (
                  <div className="admin-booking-view__field">
                    <label>What to Bring (sent to guest)</label>
                    <p className="admin-booking-view__text">{payment.contractRequirements}</p>
                  </div>
                )}

                {payment.screenshotUrl && (
                  <a className="admin-booking-view__screenshot" href={payment.screenshotUrl} target="_blank" rel="noreferrer">
                    <img src={payment.screenshotUrl} alt="Payment screenshot" />
                  </a>
                )}

                <div className="admin-booking-view__payment-actions">
                  <button type="button" className="admin-btn admin-btn-primary" onClick={() => setApproving(true)}>
                    <FaCheck /> Approve — Money Received
                  </button>
                  <button type="button" className="admin-btn admin-btn-outline" onClick={() => handlePaymentStatus('Partial')}>
                    <FaAdjust /> Mark Partial
                  </button>
                  <button type="button" className="admin-btn admin-btn-outline" onClick={() => handlePaymentStatus('Failed')}>
                    <FaBan /> Reject — Not Received
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {approving && (
        <ApprovePaymentModal
          onClose={() => setApproving(false)}
          onApprove={handleApproveSubmit}
        />
      )}
    </div>
  );
}
