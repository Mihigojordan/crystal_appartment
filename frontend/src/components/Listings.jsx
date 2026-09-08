import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa';
import { listings } from '../data/listings';
import './Listings.css';

export default function Listings() {
  return (
    <section id="listings" className="listings">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Featured Homes</span>
          <h2 className="section-title">Available Apartments</h2>
          <p>Hand-picked units ready for move-in, updated daily across our communities.</p>
        </div>

        <div className="listings__grid">
          {listings.map((l) => (
            <div className="listing-card" key={l.id}>
              <div className="listing-card__image">
                <img src={l.image} alt={l.title} />
                <span className="listing-card__price">{l.price}</span>
              </div>
              <div className="listing-card__body">
                <h3>{l.title}</h3>
                <p className="listing-card__location"><FaMapMarkerAlt /> {l.location}</p>
                <div className="listing-card__meta">
                  <span><FaBed /> {l.beds} Beds</span>
                  <span><FaBath /> {l.baths} Baths</span>
                  <span><FaRulerCombined /> {l.size}</span>
                </div>
                <Link to={`/apartments/${l.id}`} className="listing-card__link">View More &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
