import { useEffect, useState } from 'react';
import {
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaArrowLeft,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaBolt,
} from 'react-icons/fa';
import { apiFetch } from '../lib/apiClient';
import { trackEvent } from '../lib/analytics';
import './BookingModal.css';

const STEP_LABELS = { tour: 'Tour Date', direct: 'Book Directly', info: 'Your Info', payment: 'Payment' };
const AMOUNT_MATCH_TOLERANCE = 1;

export default function BookingModal({ listing, onClose }) {
  const [step, setStep] = useState('tour');
  const [form, setForm] = useState({
    tourDate: '',
    tourTime: '',
    skippedTour: false,
    name: '',
    email: '',
    phone: '',
    moveIn: '',
    notes: '',
    paymentPhone: '',
    paymentAmount: '',
    paymentDate: '',
  });

  const [paymentType, setPaymentType] = useState('momo');
  const [cardAmount, setCardAmount] = useState(listing?.amountUsd ? String(listing.amountUsd) : '');
  const [cardSubmitting, setCardSubmitting] = useState(false);
  const [cardError, setCardError] = useState('');

  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const resetVerification = () => {
    setExtracted(null);
    setMatched(false);
    setVerifyError('');
  };

  const updateAndReset = (field) => (e) => {
    resetVerification();
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const goToInfo = (skipped) => {
    setForm((f) => ({ ...f, skippedTour: skipped }));
    setStep('info');
  };

  const uploadScreenshot = async (file) => {
    if (!file) return;
    resetVerification();
    setUploadError('');
    setUploadingScreenshot(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const result = await apiFetch('/uploads/payment-screenshot', { method: 'POST', body });
      setScreenshotUrl(result.url);
    } catch (err) {
      setUploadError(err.message);
      setScreenshotUrl('');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const verifyPayment = async () => {
    if (!screenshotUrl || !form.paymentAmount || !form.paymentDate) return;
    setVerifying(true);
    setVerifyError('');
    try {
      const result = await apiFetch('/payments/extract', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: screenshotUrl }),
      });
      setExtracted(result);
      const amountOk =
        result.amount != null &&
        Math.abs(result.amount - Number(form.paymentAmount)) <= AMOUNT_MATCH_TOLERANCE;
      const dateOk = !result.date || result.date === form.paymentDate;
      setMatched(amountOk && dateOk);
    } catch (err) {
      setVerifyError(err.message);
      setMatched(false);
    } finally {
      setVerifying(false);
    }
  };

  const submitBooking = async (type) => {
    const created = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        apartmentId: listing?.id ?? '',
        apartmentTitle: listing?.title ?? '',
        type,
        tourDate: form.tourDate || undefined,
        tourTime: form.tourTime || undefined,
        moveIn: form.moveIn || undefined,
        notes: form.notes || undefined,
      }),
    });
    trackEvent('booking_submitted', {
      booking_type: type,
      apartment_id: listing?.id ?? '',
    });
    return created;
  };

  const submitTourRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitBooking('tour');
      setStep('confirm');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!matched) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const booking = await submitBooking('direct');
      await apiFetch('/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          guestName: form.name,
          guestPhone: form.paymentPhone,
          apartmentId: listing?.id ?? '',
          apartmentName: listing?.title ?? '',
          bookingId: booking.id,
          method: 'MoMo',
          amount: Number(form.paymentAmount),
          date: form.paymentDate,
          screenshotUrl,
          extractedAmount: extracted?.amount ?? undefined,
          extractedDate: extracted?.date ?? undefined,
        }),
      });
      setStep('confirm');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const payWithCard = async () => {
    if (!form.name || !form.email) {
      setCardError('Please go back and fill in your name and email first.');
      return;
    }
    if (!cardAmount || Number(cardAmount) <= 0) return;
    setCardSubmitting(true);
    setCardError('');
    try {
      const booking = await submitBooking('direct');
      const order = await apiFetch('/payments/pesapal/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(cardAmount),
          guestName: form.name,
          guestEmail: form.email,
          guestPhone: form.phone,
          apartmentId: listing?.id ?? '',
          apartmentName: listing?.title ?? '',
          bookingId: booking.id,
        }),
      });
      window.location.href = order.redirectUrl;
    } catch (err) {
      setCardError(err.message);
      setCardSubmitting(false);
    }
  };

  const flowSteps = form.skippedTour ? ['tour', 'info', 'payment'] : ['tour', 'info'];
  const progressIndex = flowSteps.indexOf(step);

  return (
    <div className="booking-modal" onClick={onClose}>
      <div className="booking-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="booking-modal__close" aria-label="Close" onClick={onClose}>
          <FaTimes />
        </button>

        {listing && step !== 'confirm' && (
          <div className="booking-modal__summary">
            <img src={listing.image} alt={listing.title} />
            <div>
              <h5>{listing.title}</h5>
              <span>{listing.price}</span>
            </div>
          </div>
        )}

        {step !== 'confirm' && (
          <div className="booking-modal__steps">
            {flowSteps.map((s, i) => (
              <div key={s} className={`booking-modal__step ${i <= progressIndex ? 'is-active' : ''}`}>
                <span>{i + 1}</span>
                {s === 'tour' && form.skippedTour ? STEP_LABELS.direct : STEP_LABELS[s]}
              </div>
            ))}
          </div>
        )}

        {step === 'tour' && (
          <div className="booking-modal__body">
            <h3>Schedule a Tour</h3>
            <p className="booking-modal__lead">
              Pick a date and time that works for you, or skip straight to booking.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToInfo(false);
              }}
            >
              <div className="booking-modal__row">
                <div className="booking-modal__field">
                  <label htmlFor="tour-date">Tour Date</label>
                  <input
                    id="tour-date"
                    type="date"
                    required
                    value={form.tourDate}
                    onChange={update('tourDate')}
                  />
                </div>
                <div className="booking-modal__field">
                  <label htmlFor="tour-time">Preferred Time</label>
                  <select id="tour-time" required value={form.tourTime} onChange={update('tourTime')}>
                    <option value="" disabled>Select a time</option>
                    <option>Morning (9am - 12pm)</option>
                    <option>Afternoon (12pm - 4pm)</option>
                    <option>Evening (4pm - 7pm)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary booking-modal__submit">
                <FaCalendarAlt /> Continue with Tour Date
              </button>
            </form>

            <button type="button" className="btn btn-primary booking-modal__submit booking-modal__book-direct" onClick={() => goToInfo(true)}>
              <FaBolt /> Book Directly
            </button>
          </div>
        )}

        {step === 'info' && (
          <div className="booking-modal__body">
            <h3>Your Information</h3>
            <p className="booking-modal__lead">
              {form.skippedTour
                ? "Tell us about you and we'll set up your booking directly."
                : `We'll confirm your tour for ${form.tourDate || 'your chosen date'}${form.tourTime ? `, ${form.tourTime}` : ''}.`}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (form.skippedTour) {
                  setStep('payment');
                } else {
                  submitTourRequest(e);
                }
              }}
            >
              <div className="booking-modal__row">
                <div className="booking-modal__field">
                  <label htmlFor="info-name">Full Name</label>
                  <input id="info-name" type="text" required value={form.name} onChange={update('name')} placeholder="Your name" />
                </div>
                <div className="booking-modal__field">
                  <label htmlFor="info-phone">Phone</label>
                  <input id="info-phone" type="tel" required value={form.phone} onChange={update('phone')} placeholder="Your phone number" />
                </div>
              </div>

              <div className="booking-modal__field">
                <label htmlFor="info-email">Email</label>
                <input id="info-email" type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="info-movein">Desired Move-in Date</label>
                <input id="info-movein" type="date" value={form.moveIn} onChange={update('moveIn')} />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="info-notes">Notes (optional)</label>
                <textarea id="info-notes" rows="3" value={form.notes} onChange={update('notes')} placeholder="Anything we should know?" />
              </div>

              {submitError && !form.skippedTour && (
                <p className="booking-modal__error">{submitError}</p>
              )}

              <div className="booking-modal__actions">
                <button type="button" className="booking-modal__back" onClick={() => setStep('tour')}>
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="btn btn-primary booking-modal__submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : form.skippedTour ? 'Continue to Payment' : 'Confirm Tour Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="booking-modal__body">
            <h3>Payment</h3>
            <p className="booking-modal__lead">
              <FaLock /> Choose how you&apos;d like to pay your deposit.
            </p>

            <div className="booking-modal__method-toggle">
              <button type="button" className={paymentType === 'momo' ? 'is-active' : ''} onClick={() => setPaymentType('momo')}>
                Mobile Money
              </button>
              <button
                type="button"
                className="is-disabled"
                disabled
                title="Card payments are still in testing and temporarily unavailable"
              >
                Card (Coming Soon)
              </button>
            </div>

            {paymentType === 'momo' ? (
              <form onSubmit={submitPayment}>
                <div className="booking-modal__field">
                  <label htmlFor="pay-phone">Phone Number Used to Pay (MTN MoMo)</label>
                  <input
                    id="pay-phone"
                    type="tel"
                    required
                    value={form.paymentPhone}
                    onChange={update('paymentPhone')}
                    placeholder="e.g. 078xxxxxxx"
                  />
                </div>

                <div className="booking-modal__row">
                  <div className="booking-modal__field">
                    <label htmlFor="pay-amount">Amount Paid (RWF)</label>
                    <input
                      id="pay-amount"
                      type="number"
                      min="0"
                      required
                      value={form.paymentAmount}
                      onChange={updateAndReset('paymentAmount')}
                      placeholder="e.g. 65000"
                    />
                  </div>
                  <div className="booking-modal__field">
                    <label htmlFor="pay-date">Date of Payment</label>
                    <input
                      id="pay-date"
                      type="date"
                      required
                      value={form.paymentDate}
                      onChange={updateAndReset('paymentDate')}
                    />
                  </div>
                </div>

                <div className="booking-modal__field">
                  <label htmlFor="pay-screenshot">Payment Confirmation Screenshot</label>
                  <label className="booking-modal__upload">
                    <FaCloudUploadAlt />
                    {uploadingScreenshot ? 'Uploading…' : screenshotUrl ? 'Replace screenshot' : 'Choose screenshot'}
                    <input
                      id="pay-screenshot"
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingScreenshot}
                      onChange={(e) => { uploadScreenshot(e.target.files[0]); e.target.value = ''; }}
                    />
                  </label>
                  {uploadError && <p className="booking-modal__error">{uploadError}</p>}
                  {screenshotUrl && (
                    <div className="booking-modal__screenshot">
                      <img src={screenshotUrl} alt="Payment confirmation" />
                    </div>
                  )}
                </div>

                {screenshotUrl && !matched && (
                  <button
                    type="button"
                    className="booking-modal__verify"
                    onClick={verifyPayment}
                    disabled={verifying || !form.paymentAmount || !form.paymentDate}
                  >
                    <FaShieldAlt /> {verifying ? 'Verifying…' : 'Verify Payment'}
                  </button>
                )}

                {verifyError && <p className="booking-modal__error">{verifyError}</p>}

                {extracted && (
                  <div className={`booking-modal__match ${matched ? 'is-match' : 'is-mismatch'}`}>
                    {matched ? <FaCheckCircle /> : <FaTimesCircle />}
                    <div>
                      <strong>{matched ? 'Payment verified' : "That doesn't match what you entered"}</strong>
                      <span>
                        Screenshot shows {extracted.amount != null ? `RWF ${extracted.amount.toLocaleString()}` : 'an unreadable amount'}
                        {extracted.date ? ` on ${extracted.date}` : ''}.
                        {!matched && ' Double-check your amount/date, or upload a clearer screenshot.'}
                      </span>
                    </div>
                  </div>
                )}

                {submitError && <p className="booking-modal__error">{submitError}</p>}

                <div className="booking-modal__actions">
                  <button type="button" className="booking-modal__back" onClick={() => setStep('info')}>
                    <FaArrowLeft /> Back
                  </button>
                  <button type="submit" className="btn btn-primary booking-modal__submit" disabled={submitting || !matched}>
                    {submitting ? 'Submitting…' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="booking-modal__field">
                  <label htmlFor="pay-card-amount">Amount to Pay (USD)</label>
                  <input
                    id="pay-card-amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>

                <p className="booking-modal__lead">
                  You&apos;ll be redirected to Pesapal&apos;s secure checkout to complete your card payment.
                </p>

                {cardError && <p className="booking-modal__error">{cardError}</p>}

                <div className="booking-modal__actions">
                  <button type="button" className="booking-modal__back" onClick={() => setStep('info')}>
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary booking-modal__submit"
                    onClick={payWithCard}
                    disabled={cardSubmitting || !cardAmount || Number(cardAmount) <= 0}
                  >
                    {cardSubmitting ? 'Redirecting…' : 'Pay with Card'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="booking-modal__body booking-modal__confirm">
            <span className="booking-modal__confirm-icon"><FaCheckCircle /></span>
            <h3>{form.skippedTour ? 'Booking Confirmed!' : 'Tour Confirmed!'}</h3>
            <p className="booking-modal__lead">
              {form.skippedTour
                ? `Thanks, ${form.name || 'there'} — we've received your payment proof for ${listing?.title || 'this apartment'}. Our team will confirm it shortly.`
                : `Thanks, ${form.name || 'there'} — your tour is set for ${form.tourDate}${form.tourTime ? `, ${form.tourTime}` : ''}. No payment is needed for the tour.`}
            </p>
            <p className="booking-modal__confirm-note">
              A confirmation has been sent to {form.email || 'your email'}. Our team will reach out at{' '}
              {form.phone || 'your phone number'} to finalize the details.
            </p>
            <button type="button" className="btn btn-primary booking-modal__submit" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
