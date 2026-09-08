import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaStar,
  FaDraftingCompass,
} from 'react-icons/fa';
import { getListingById, listings } from '../data/listings';
import BookingModal from './BookingModal';
import './ApartmentDetail.css';

export default function ApartmentDetail() {
  const { id } = useParams();
  const listing = getListingById(id);
  const [active, setActive] = useState(0);
  const [booking, setBooking] = useState(false);

  if (!listing) {
    return (
      <section className="apt-detail apt-detail--empty">
        <div className="container">
          <h2>Apartment not found</h2>
          <p>The listing you&apos;re looking for may have been rented or removed.</p>
          <Link to="/apartments" className="btn btn-primary">Back to Apartments</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="apt-detail">
      <div className="container">
        <Link to="/apartments" className="apt-detail__back"><FaArrowLeft /> Back to Apartments</Link>

        <div className="apt-detail__gallery">
          <div className="apt-detail__main-image">
            <img src={listing.gallery[active]} alt={listing.title} />
            <span className="apt-detail__price">{listing.price}</span>
          </div>
          <div className="apt-detail__thumbs">
            {listing.gallery.map((img, i) => (
              i === active ? null : (
                <button
                  type="button"
                  key={img}
                  className="apt-detail__thumb"
                  onClick={() => setActive(i)}
                >
                  <img src={img} alt={`${listing.title} view ${i + 1}`} />
                </button>
              )
            ))}
          </div>
        </div>

        <div className="apt-detail__grid">
          <div className="apt-detail__info">
            <h1>{listing.title}</h1>
            <p className="apt-detail__location"><FaMapMarkerAlt /> {listing.location}</p>

            <div className="apt-detail__stats">
              <div className="apt-detail__stat">
                <strong>{listing.beds}</strong>
                <span>Beds</span>
              </div>
              <div className="apt-detail__stat">
                <strong>{listing.baths}</strong>
                <span>Baths</span>
              </div>
              <div className="apt-detail__stat">
                <strong>{listing.size.split(' ')[0]}</strong>
                <span>Sq Ft</span>
              </div>
            </div>

            <p className="apt-detail__desc">{listing.description}</p>

            <h4>Amenities</h4>
            <ul className="apt-detail__amenities">
              {listing.amenities.map((a) => (
                <li key={a}><FaCheckCircle /> {a}</li>
              ))}
            </ul>

            <div className="apt-detail__split">
              <div>
                <h4>Floor Plan</h4>
                <div className="apt-detail__placeholder">
                  <FaDraftingCompass />
                  <span>Floor plan available on request</span>
                </div>
              </div>
              <div>
                <h4>Location</h4>
                <div className="apt-detail__map">
                  <iframe
                    title={`${listing.title} location`}
                    src="https://maps.google.com/maps?q=Kimihurura,Kigali,Rwanda&z=14&output=embed"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <h4>Neighborhood Highlights</h4>
            <div className="apt-detail__hoods">
              {listing.neighborhood.map((n) => (
                <div className="apt-detail__hood" key={n.name}>
                  <h5>{n.name}</h5>
                  <span>{n.distance}</span>
                </div>
              ))}
            </div>

            <div className="apt-detail__reviews-head">
              <h4>Reviews</h4>
              <span className="apt-detail__rating">
                {listing.reviews.rating}
                <span className="apt-detail__stars">
                  {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} />)}
                </span>
                ({listing.reviews.count} reviews)
              </span>
            </div>
            <div className="apt-detail__review-grid">
              {listing.reviews.items.map((r) => (
                <div className="apt-detail__review" key={r.name}>
                  <span className="apt-detail__review-stars">
                    {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} />)}
                  </span>
                  <p>&ldquo;{r.text}&rdquo;</p>
                  <strong>{r.name}</strong>
                </div>
              ))}
            </div>

            <h4>Lease Terms &amp; Policies</h4>
            <div className="apt-detail__lease">
              <div>
                <span>Lease Length</span>
                <strong>{listing.lease.length}</strong>
              </div>
              <div>
                <span>Security Deposit</span>
                <strong>{listing.lease.deposit}</strong>
              </div>
              <div>
                <span>Pet Policy</span>
                <strong>{listing.lease.pets}</strong>
              </div>
              <div>
                <span>Move-in Date</span>
                <strong>{listing.lease.moveIn}</strong>
              </div>
            </div>
          </div>

          <div className="apt-detail__cta">
            <span className="apt-detail__cta-price">{listing.price}</span>
            <p>Schedule a tour or ask a question — our team responds quickly.</p>
            <button type="button" className="btn btn-primary apt-detail__cta-btn" onClick={() => setBooking(true)}>
              Schedule a Tour
            </button>
          </div>
        </div>

        <div className="apt-detail__more">
          <h3>Other Apartments</h3>
          <div className="apt-detail__more-grid">
            {listings.filter((l) => l.id !== listing.id).map((l) => (
              <Link to={`/apartments/${l.id}`} className="apt-detail__more-card" key={l.id}>
                <img src={l.image} alt={l.title} />
                <div>
                  <h5>{l.title}</h5>
                  <span>{l.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {booking && <BookingModal listing={listing} onClose={() => setBooking(false)} />}
    </section>
  );
}
