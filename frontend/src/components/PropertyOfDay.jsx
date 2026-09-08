import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import './PropertyOfDay.css';

const gallery = [
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=900&auto=format&fit=crop',
];

export default function PropertyOfDay() {
  const [active, setActive] = useState(0);

  return (
    <section className="potd" style={{ backgroundImage: `url(${gallery[0]})` }}>
      <div className="potd__overlay" />

      <div className="container potd__heading">
        <h2>Property Of The Day</h2>
        <p>Discover Kigali&apos;s best restaurants, nightlife, and things to do nearby.</p>
      </div>

      <div className="container">
        <div className="potd__card">
          <div className="potd__image">
            <img src={gallery[active]} alt="Featured apartment" />
            <div className="potd__dots">
              {gallery.map((g, i) => (
                <button
                  key={g}
                  className={`potd__dot ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="potd__details">
            <h3><span>The Aspen Suite in</span> Riverside Green</h3>
            <p className="potd__location">204 Riverside Green, Kigali</p>
            <p className="potd__desc">
              A bright, elegant two-bedroom suite with an open-plan kitchen, private balcony,
              and floor-to-ceiling windows overlooking the river green.
            </p>

            <div className="potd__meta">
              <span className="potd__stat"><i><FaBed /></i> 2 Bedroom</span>
              <span className="potd__stat"><i><FaBath /></i> 2 Bathroom</span>
              <span className="potd__badge"><FaRulerCombined /> 1,240 Sq Ft</span>
            </div>

            <div className="potd__footer">
              <div>
                <span className="potd__price">$1,450</span>
                <span className="potd__forsale">/mo &middot; Available Now</span>
              </div>
              <Link to="/contact" className="btn btn-primary potd__cta">View Apartment</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
