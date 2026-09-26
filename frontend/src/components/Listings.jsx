import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import { apiFetch } from '../lib/apiClient';
import { useCurrency } from '../context/useCurrency';
import './Listings.css';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    apiFetch('/apartments/public')
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="listings" className="listings">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Featured Homes</span>
          <h2 className="section-title">Available Rental Stays</h2>
          <p>Hand-picked rental stays ready for you, updated daily across our property.</p>
        </div>

        {loading ? (
          <p className="listings__status">Loading rental stays…</p>
        ) : error ? (
          <p className="listings__status">{error}</p>
        ) : listings.length === 0 ? (
          <p className="listings__status">No rental stays available right now — check back soon.</p>
        ) : (
          <div className="listings__grid">
            {listings.map((l) => (
              <Link to={`/apartments/${l.id}`} className="listing-card" key={l.id}>
                <div className="listing-card__image">
                  {l.image ? (
                    <img src={l.image} alt={l.name} />
                  ) : (
                    <div className="listing-card__noimage">No photo yet</div>
                  )}
                  <span className="listing-card__price">{formatPrice(l.rent, '/mo')}</span>
                </div>
                <div className="listing-card__body">
                  <h3>{l.name}</h3>
                  <p className="listing-card__location"><FaMapMarkerAlt /> {l.location || 'Location on request'}</p>
                  <div className="listing-card__meta">
                    <span><FaBed /> {l.bedrooms ?? '—'} Beds</span>
                    <span><FaBath /> {l.bathrooms ?? '—'} Baths</span>
                    <span><FaRulerCombined /> {l.sqft ? `${l.sqft} sqft` : '—'}</span>
                  </div>
                  <span className="listing-card__link">View More &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
