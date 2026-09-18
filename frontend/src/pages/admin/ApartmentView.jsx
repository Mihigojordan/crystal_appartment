import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import './ApartmentView.css';

const badgeClass = (status) =>
  status === 'Occupied' ? 'admin-badge-success' : status === 'Maintenance' ? 'admin-badge-warning' : 'admin-badge-muted';

function Field({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value ?? '—'}</dd>
    </>
  );
}

export default function ApartmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`/apartments/${id}`).then(setApartment).catch((err) => setError(err.message));
  }, [id]);

  const handleDelete = async () => {
    if (!apartment || !confirm(`Delete "${apartment.name}"?`)) return;
    await apiFetch(`/apartments/${apartment.id}`, { method: 'DELETE' });
    navigate('/admin/apartments');
  };

  if (error) return <p className="admin-empty-state">{error}</p>;
  if (!apartment) return <p className="admin-empty-state">Loading…</p>;

  const address = [apartment.streetAddress, apartment.city, apartment.region, apartment.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="admin-apt-view">
      <div className="admin-apt-view__head">
        <button type="button" className="admin-btn admin-btn-outline" onClick={() => navigate('/admin/apartments')}>
          <FaArrowLeft /> Back
        </button>
        <h2>{apartment.name}</h2>
        <div className="admin-apt-view__head-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => navigate(`/admin/apartments/${apartment.id}/edit`)}
          >
            <FaEdit /> Edit
          </button>
          <button type="button" className="admin-btn admin-btn-outline" onClick={handleDelete}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {apartment.image && <img className="admin-apt-view__hero" src={apartment.image} alt={apartment.name} />}

      <div className="admin-card admin-apt-view__summary">
        <span className={`admin-badge ${badgeClass(apartment.status)}`}>{apartment.status}</span>
        {apartment.propertyType && <span className="admin-badge admin-badge-muted">{apartment.propertyType}</span>}
        {apartment.listingVisibility && <span className="admin-text-muted">{apartment.listingVisibility}</span>}
        <span className="admin-apt-view__rent">${apartment.rent.toLocaleString()}/mo</span>
      </div>

      <div className="admin-apt-view__body">
        <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
          <h3>Details</h3>
          <dl className="admin-apt-view__fields">
            <Field label="Tenant" value={apartment.tenant} />
            <Field label="Unit / Floor" value={apartment.unitNumber} />
            <Field label="Bedrooms" value={apartment.bedrooms} />
            <Field label="Bathrooms" value={apartment.bathrooms} />
            <Field label="Square Feet" value={apartment.sqft} />
            <Field label="Max Occupancy" value={apartment.maxOccupancy} />
            <Field label="Floor Level" value={apartment.floorLevel} />
            <Field label="Furnishing" value={apartment.furnishingStatus} />
          </dl>
        </section>

        <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
          <h3>Location</h3>
          <dl className="admin-apt-view__fields">
            <Field label="Location" value={apartment.location} />
            <Field label="Address" value={address || null} />
            <Field label="Neighborhood" value={apartment.neighborhood} />
            <Field
              label="Google Maps"
              value={
                apartment.googleMapsLink ? (
                  <a href={apartment.googleMapsLink} target="_blank" rel="noreferrer">Open map</a>
                ) : null
              }
            />
          </dl>
        </section>

        <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
          <h3>Pricing</h3>
          <dl className="admin-apt-view__fields">
            <Field label="Billing Cycle" value={apartment.billingCycle} />
            <Field label="Daily Rate" value={apartment.dailyRate != null ? `$${apartment.dailyRate}` : null} />
            <Field label="6-Month Rate" value={apartment.sixMonthRate != null ? `$${apartment.sixMonthRate}` : null} />
            <Field label="Yearly Rate" value={apartment.yearlyRate != null ? `$${apartment.yearlyRate}` : null} />
            <Field label="Security Deposit" value={apartment.securityDeposit != null ? `$${apartment.securityDeposit}` : null} />
            <Field label="Long-Stay Discount" value={apartment.longStayDiscount != null ? `${apartment.longStayDiscount}%` : null} />
          </dl>
        </section>

        <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
          <h3>Lease Terms &amp; Policies</h3>
          <dl className="admin-apt-view__fields">
            <Field label="Minimum Stay" value={apartment.minimumStay} />
            <Field label="Pet Policy" value={apartment.petPolicy} />
            <Field label="Smoking Policy" value={apartment.smokingPolicy} />
            <Field label="Cancellation Policy" value={apartment.cancellationPolicy} />
            <Field label="Available From" value={apartment.availableFrom} />
          </dl>
        </section>

        {apartment.description && (
          <section className="admin-card admin-apt-view__section">
            <h3>Description</h3>
            <p className="admin-apt-view__text">{apartment.description}</p>
          </section>
        )}

        {apartment.additionalNotes && (
          <section className="admin-card admin-apt-view__section">
            <h3>Additional Notes</h3>
            <p className="admin-apt-view__text">{apartment.additionalNotes}</p>
          </section>
        )}

        {apartment.amenities?.length > 0 && (
          <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
            <h3>Amenities</h3>
            <div className="admin-apt-view__tags">
              {apartment.amenities.map((a) => (
                <span key={a} className="admin-badge admin-badge-muted">{a}</span>
              ))}
            </div>
          </section>
        )}

        {apartment.utilitiesIncluded?.length > 0 && (
          <section className="admin-card admin-apt-view__section admin-apt-view__section--half">
            <h3>Utilities Included</h3>
            <div className="admin-apt-view__tags">
              {apartment.utilitiesIncluded.map((u) => (
                <span key={u} className="admin-badge admin-badge-muted">{u}</span>
              ))}
            </div>
          </section>
        )}

        {apartment.neighborhoodHighlights?.length > 0 && (
          <section className="admin-card admin-apt-view__section">
            <h3>Neighborhood Highlights</h3>
            <div className="admin-apt-view__tags">
              {apartment.neighborhoodHighlights.map((h) => (
                <span key={h} className="admin-badge admin-badge-muted">{h}</span>
              ))}
            </div>
          </section>
        )}

        {apartment.gallery?.length > 0 && (
          <section className="admin-card admin-apt-view__section">
            <h3>Gallery</h3>
            <div className="admin-apt-view__gallery">
              {apartment.gallery.map((url, i) => (
                <img key={i} src={url} alt="" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
