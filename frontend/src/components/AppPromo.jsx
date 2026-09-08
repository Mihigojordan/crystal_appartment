import { FaApple, FaGooglePlay, FaHome, FaSearchDollar } from 'react-icons/fa';
import './AppPromo.css';

export default function AppPromo() {
  return (
    <section className="apppromo">
      <div className="apppromo__card">
        <div className="apppromo__phones">
          <div className="apppromo__phone apppromo__phone--back">
            <div className="apppromo__phone-notch" />
            <div className="apppromo__phone-screen">
              <span className="apppromo__phone-tag">For Rent</span>
              <div className="apppromo__phone-row">
                <FaHome />
                <div>
                  <strong>Riverside Green Suite</strong>
                  <small>2 Bed &middot; 2 Bath &middot; $1,450/mo</small>
                </div>
              </div>
              <div className="apppromo__phone-row">
                <FaHome />
                <div>
                  <strong>Maple Court Suite</strong>
                  <small>1 Bed &middot; 1 Bath &middot; $980/mo</small>
                </div>
              </div>
              <div className="apppromo__phone-row">
                <FaHome />
                <div>
                  <strong>Cedar Heights Studio</strong>
                  <small>Studio &middot; 1 Bath &middot; $720/mo</small>
                </div>
              </div>
            </div>
          </div>

          <div className="apppromo__phone apppromo__phone--front">
            <div className="apppromo__phone-notch" />
            <div className="apppromo__phone-screen apppromo__phone-screen--dark">
              <FaSearchDollar className="apppromo__phone-icon" />
              <p>How much is my home worth?</p>
              <button type="button" className="apppromo__phone-btn">Get Estimate</button>
            </div>
          </div>
        </div>

        <div className="apppromo__content">
          <span className="section-tag">Free Download</span>
          <h2 className="section-title">Take your home search everywhere you go</h2>
          <p>
            Search anytime, anywhere with our award-winning app for iPhone, iPad and
            Android. See what&apos;s for rent around you and instantly request a tour.
          </p>

          <div className="apppromo__stores">
            <a href="#" className="apppromo__store apppromo__store--primary">
              <FaGooglePlay /> Play Store
            </a>
            <a href="#" className="apppromo__store">
              <FaApple /> App Store
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
