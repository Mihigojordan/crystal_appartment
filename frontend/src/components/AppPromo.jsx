import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope } from 'react-icons/fa';
import './AppPromo.css';

export default function AppPromo() {
  return (
    <section className="apppromo">
      <div className="apppromo__card">
        <div className="apppromo__content">
          <span className="section-tag">Book With Ease</span>
          <h2 className="section-title">Everything you need, in one simple place</h2>
          <p>
            Browse verified listings, compare prices, and request a tour in minutes.
            Our team replies fast so you can settle into your next home without the
            back-and-forth.
          </p>

          <div className="apppromo__actions">
            <Link to="/apartments" className="apppromo__action apppromo__action--primary">
              <FaHome /> Browse Rental Stays
            </Link>
            <Link to="/contact" className="apppromo__action">
              <FaEnvelope /> Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
