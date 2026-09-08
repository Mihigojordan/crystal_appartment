import { useEffect, useState } from 'react';
import {
  FaTimes,
  FaCalendarAlt,
  FaCheckCircle,
  FaLock,
  FaArrowLeft,
} from 'react-icons/fa';
import './BookingModal.css';

const STEP_LABELS = { tour: 'Tour Date', direct: 'Book Directly', info: 'Your Info', payment: 'Payment' };

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
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

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

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const goToInfo = (skipped) => {
    setForm((f) => ({ ...f, skippedTour: skipped }));
    setStep('info');
  };

  const submitPayment = (e) => {
    e.preventDefault();
    setStep('confirm');
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

            <button type="button" className="booking-modal__skip" onClick={() => goToInfo(true)}>
              Skip tour date &mdash; book directly
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
                setStep(form.skippedTour ? 'payment' : 'confirm');
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

              <div className="booking-modal__actions">
                <button type="button" className="booking-modal__back" onClick={() => setStep('tour')}>
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="btn btn-primary booking-modal__submit">
                  {form.skippedTour ? 'Continue to Payment' : 'Confirm Tour Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="booking-modal__body">
            <h3>Payment Details</h3>
            <p className="booking-modal__lead">
              <FaLock /> Secure checkout &mdash; a hold deposit confirms your booking.
            </p>

            <form onSubmit={submitPayment}>
              <div className="booking-modal__field">
                <label htmlFor="pay-name">Name on Card</label>
                <input id="pay-name" type="text" required value={form.cardName} onChange={update('cardName')} placeholder="Full name" />
              </div>

              <div className="booking-modal__field">
                <label htmlFor="pay-number">Card Number</label>
                <input
                  id="pay-number"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={19}
                  value={form.cardNumber}
                  onChange={update('cardNumber')}
                  placeholder="1234 1234 1234 1234"
                />
              </div>

              <div className="booking-modal__row">
                <div className="booking-modal__field">
                  <label htmlFor="pay-expiry">Expiry</label>
                  <input id="pay-expiry" type="text" required value={form.expiry} onChange={update('expiry')} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="booking-modal__field">
                  <label htmlFor="pay-cvc">CVC</label>
                  <input id="pay-cvc" type="text" inputMode="numeric" required value={form.cvc} onChange={update('cvc')} placeholder="123" maxLength={4} />
                </div>
              </div>

              <div className="booking-modal__actions">
                <button type="button" className="booking-modal__back" onClick={() => setStep('info')}>
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="btn btn-primary booking-modal__submit">
                  Pay &amp; Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'confirm' && (
          <div className="booking-modal__body booking-modal__confirm">
            <span className="booking-modal__confirm-icon"><FaCheckCircle /></span>
            <h3>{form.skippedTour ? 'Booking Confirmed!' : 'Tour Confirmed!'}</h3>
            <p className="booking-modal__lead">
              {form.skippedTour
                ? `Thanks, ${form.name || 'there'} — your booking request for ${listing?.title || 'this apartment'} has been received.`
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
