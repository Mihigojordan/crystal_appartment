import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { apiFetch } from '../lib/apiClient';
import './PaymentSuccessPage.css';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderTrackingId) {
      setStatus('error');
      setError('Missing payment reference.');
      return;
    }
    apiFetch(`/payments/pesapal/status/${orderTrackingId}`)
      .then((payment) => setStatus(payment.status === 'Paid' ? 'paid' : 'pending'))
      .catch((err) => {
        setStatus('error');
        setError(err.message);
      });
  }, [orderTrackingId]);

  return (
    <section className="payment-success">
      <div className="container payment-success__panel">
        {status === 'checking' && <p className="payment-success__checking">Confirming your payment…</p>}

        {status === 'paid' && (
          <>
            <span className="payment-success__icon payment-success__icon--ok"><FaCheckCircle /></span>
            <h1>Payment Confirmed!</h1>
            <p>Thank you — we&apos;ve received your payment and your booking is confirmed. A receipt has been sent to your email.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <span className="payment-success__icon payment-success__icon--pending"><FaClock /></span>
            <h1>Still Processing</h1>
            <p>We haven&apos;t received confirmation yet. If you just paid, wait a moment and refresh this page, or contact us if this persists.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="payment-success__icon payment-success__icon--error"><FaTimesCircle /></span>
            <h1>Something Went Wrong</h1>
            <p>{error || 'We could not confirm your payment.'}</p>
          </>
        )}

        <Link to="/" className="btn btn-primary payment-success__cta">Back to Home</Link>
      </div>
    </section>
  );
}
