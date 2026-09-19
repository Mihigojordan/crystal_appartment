import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExternalLinkAlt, FaPlayCircle } from 'react-icons/fa';
import { apiFetch } from '../lib/apiClient';
import { AMENITY_OPTIONS, HIGHLIGHT_OPTIONS, iconFor } from '../lib/apartmentOptions';
import { useCurrency } from '../context/useCurrency';
import BookingModal from './BookingModal';
import './ApartmentDetail.css';

const VISIBILITY_LABELS = {
  'Public — visible on website': 'Public Listing',
  'Private — internal only': 'Private Listing',
  Draft: 'Draft Listing',
};

export default function ApartmentDetail({ apartment, error }) {
  const [active, setActive] = useState(0);
  const [booking, setBooking] = useState(false);
  const [others, setOthers] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setActive(0);
  }, [apartment?.id]);

  useEffect(() => {
    if (!apartment) return;
    apiFetch('/apartments/public')
      .then((all) => setOthers(all.filter((a) => a.id !== apartment.id).slice(0, 3)))
      .catch(() => setOthers([]));
  }, [apartment]);

  if (error) {
    return (
      <section className="apt-detail apt-detail--empty">
        <div className="container">
          <h2>Rental stay not found</h2>
          <p>The listing you&apos;re looking for may have been rented or removed.</p>
          <Link to="/apartments" className="btn btn-primary">Back to Rental Stays</Link>
        </div>
      </section>
    );
  }

  if (!apartment) {
    return (
      <section className="apt-detail apt-detail--empty">
        <div className="container">
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  const gallery = apartment.gallery?.length ? apartment.gallery : apartment.image ? [apartment.image] : [];
  const secondIndex = gallery.length > 1 ? (active + 1) % gallery.length : null;
  const price = formatPrice(apartment.rent, '/mo');
  const fullAddress = [apartment.streetAddress, apartment.city, apartment.region, apartment.postalCode].filter(Boolean).join(', ');
  const mapQuery = [apartment.streetAddress, apartment.city, apartment.region].filter(Boolean).join(', ') || apartment.location || 'Kigali, Rwanda';
  const mapsLink = apartment.googleMapsLink || `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}`;
  const bookingListing = { id: apartment.id, title: apartment.name, image: apartment.image, price, amountUsd: apartment.rent };

  const tags = [
    apartment.propertyType,
    apartment.furnishingStatus,
    apartment.floorLevel,
    apartment.listingVisibility ? VISIBILITY_LABELS[apartment.listingVisibility] ?? apartment.listingVisibility : null,
  ].filter(Boolean);

  const stats = [
    { value: apartment.bedrooms ?? '—', label: 'Beds' },
    { value: apartment.bathrooms ?? '—', label: 'Baths' },
    { value: apartment.sqft ?? '—', label: 'Sq Ft' },
    ...(apartment.maxOccupancy != null ? [{ value: apartment.maxOccupancy, label: 'Max Guests' }] : []),
  ];

  const pricingTiers = [
    ...(apartment.dailyRate != null ? [{ label: 'Daily Rate', price: formatPrice(apartment.dailyRate) }] : []),
    { label: 'Monthly Rate', price },
    ...(apartment.sixMonthRate != null ? [{ label: '6-Month Rate', price: formatPrice(apartment.sixMonthRate) }] : []),
    ...(apartment.yearlyRate != null ? [{ label: 'Yearly Rate', price: formatPrice(apartment.yearlyRate) }] : []),
  ];

  const leaseTerms = [
    { label: 'Minimum Stay', value: apartment.minimumStay || 'On request' },
    { label: 'Security Deposit', value: apartment.securityDeposit != null ? formatPrice(apartment.securityDeposit) : 'On request' },
    { label: 'Pet Policy', value: apartment.petPolicy || 'On request' },
    { label: 'Available From', value: apartment.availableFrom || 'Available now' },
    ...(apartment.smokingPolicy ? [{ label: 'Smoking Policy', value: apartment.smokingPolicy }] : []),
    ...(apartment.cancellationPolicy ? [{ label: 'Cancellation Policy', value: apartment.cancellationPolicy }] : []),
  ];

  return (
    <section className="apt-detail">
      <div className="container">
        <Link to="/apartments" className="apt-detail__back"><FaArrowLeft /> Back to Rental Stays</Link>

        {gallery.length > 0 && (
          <div className="apt-detail__hero">
            <div className="apt-detail__hero-main">
              <img src={gallery[active]} alt={apartment.name} />
              <span className="apt-detail__price">{price}</span>
            </div>
            {secondIndex !== null && (
              <button type="button" className="apt-detail__hero-second" onClick={() => setActive(secondIndex)}>
                <img src={gallery[secondIndex]} alt={`${apartment.name} view ${secondIndex + 1}`} />
              </button>
            )}
          </div>
        )}

        <div className="apt-detail__body">
          <div className="apt-detail__main">
            <h1>{apartment.name}</h1>

            {tags.length > 0 && (
              <div className="apt-detail__tags-row">
                {tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}

            <div className="apt-detail__location">📍 {apartment.location || 'Location on request'}</div>
            {(apartment.neighborhood || fullAddress) && (
              <div className="apt-detail__subtext">
                {[apartment.neighborhood, fullAddress].filter(Boolean).join(' · ')}
              </div>
            )}

            <div className="apt-detail__divider" />

            {apartment.description && <p className="apt-detail__desc">{apartment.description}</p>}

            <div className="apt-detail__stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="apt-detail__stat-value">{s.value}</div>
                  <div className="apt-detail__stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {apartment.amenities?.length > 0 && (
              <div className="apt-detail__block">
                <div className="apt-detail__block-title">Amenities</div>
                <div className="apt-detail__pills">
                  {apartment.amenities.map((a) => (
                    <span className="apt-detail__pill" key={a}>
                      <span>{iconFor(AMENITY_OPTIONS, a) ?? <FaCheckCircle />}</span>
                      <span>{a}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {apartment.neighborhoodHighlights?.length > 0 && (
              <div className="apt-detail__block">
                <div className="apt-detail__block-title">Neighborhood Highlights</div>
                <div className="apt-detail__pills">
                  {apartment.neighborhoodHighlights.map((h) => (
                    <span className="apt-detail__pill" key={h}>
                      <span>{iconFor(HIGHLIGHT_OPTIONS, h) ?? <FaCheckCircle />}</span>
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {apartment.utilitiesIncluded?.length > 0 && (
              <div className="apt-detail__block">
                <div className="apt-detail__block-title">Utilities Included</div>
                <div className="apt-detail__checklist">
                  {apartment.utilitiesIncluded.map((u) => (
                    <span key={u}><FaCheckCircle /> {u}</span>
                  ))}
                </div>
              </div>
            )}

            {apartment.videoTourUrl && (
              <a className="apt-detail__video" href={apartment.videoTourUrl} target="_blank" rel="noreferrer">
                <FaPlayCircle /> Watch Video Tour
              </a>
            )}

            <div className="apt-detail__block">
              <div className="apt-detail__block-title">Location</div>
              <div className="apt-detail__map">
                <iframe
                  title={`${apartment.name} location`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <a className="apt-detail__maplink" href={mapsLink} target="_blank" rel="noreferrer">
                Open in Maps <FaExternalLinkAlt />
              </a>
            </div>

            <div className="apt-detail__block">
              <div className="apt-detail__block-title">Pricing Options</div>
              <div className="apt-detail__pricing">
                {pricingTiers.map((t) => (
                  <div className="apt-detail__pricing-tier" key={t.label}>
                    <div className="apt-detail__pricing-label">{t.label}</div>
                    <div className="apt-detail__pricing-value">{t.price}</div>
                  </div>
                ))}
              </div>
              {apartment.longStayDiscount != null && (
                <div className="apt-detail__discount">
                  Save {apartment.longStayDiscount}% on long-stay bookings
                  {apartment.billingCycle ? ` — billed ${apartment.billingCycle.toLowerCase()}` : ''}.
                </div>
              )}
            </div>

            <div className="apt-detail__block">
              <div className="apt-detail__block-title">Lease Terms &amp; Policies</div>
              <div className="apt-detail__lease">
                {leaseTerms.map((lt) => (
                  <div key={lt.label}>
                    <div className="apt-detail__lease-label">{lt.label}</div>
                    <div className="apt-detail__lease-value">{lt.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {apartment.additionalNotes && (
              <div className="apt-detail__block apt-detail__block--last">
                <div className="apt-detail__block-title">Additional Notes</div>
                <p className="apt-detail__desc">{apartment.additionalNotes}</p>
              </div>
            )}
          </div>

          <div className="apt-detail__sidebar">
            <div className="apt-detail__sidebar-price">{price}</div>
            <p>Schedule a tour or ask a question — our team responds quickly.</p>
            <button type="button" className="apt-detail__sidebar-btn apt-detail__sidebar-btn--primary" onClick={() => setBooking(true)}>
              Schedule a Tour
            </button>
            <Link to="/contact" className="apt-detail__sidebar-btn apt-detail__sidebar-btn--outline">
              Ask a Question
            </Link>
          </div>
        </div>

        {others.length > 0 && (
          <div className="apt-detail__more">
            <h3>Other Rental Stays</h3>
            <div className="apt-detail__more-grid">
              {others.map((o) => (
                <Link to={`/apartments/${o.id}`} className="apt-detail__more-card" key={o.id}>
                  <img src={o.image} alt={o.name} />
                  <div>
                    <h5>{o.name}</h5>
                    <span>{formatPrice(o.rent, '/mo')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {booking && <BookingModal listing={bookingListing} onClose={() => setBooking(false)} />}
    </section>
  );
}
