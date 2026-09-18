import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import { AMENITY_OPTIONS, HIGHLIGHT_OPTIONS, UTILITY_OPTIONS } from '../../lib/apartmentOptions';
import './ApartmentForm.css';

const STATUSES = ['Vacant', 'Occupied', 'Maintenance'];
const PROPERTY_TYPES = ['Guest House', 'Apartment', 'Studio', 'Duplex', 'Penthouse', 'Townhouse'];
const LISTING_VISIBILITIES = ['Public — visible on website', 'Private — internal only', 'Draft'];
const FLOOR_LEVELS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor +'];
const FURNISHING_STATUSES = ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'];
const BILLING_CYCLES = ['Monthly', 'Daily', '6 Months', 'Yearly'];
const MINIMUM_STAYS = ['1 Night', '1 Week', '1 Month', '6 Months', '1 Year'];
const PET_POLICIES = ['No Pets Allowed', 'Cats Only', 'Dogs Only', 'Pets Allowed', 'Case by Case'];
const SMOKING_POLICIES = ['No Smoking', 'Smoking Allowed Outside Only', 'Smoking Allowed'];
const CANCELLATION_POLICIES = ['Flexible', 'Moderate', 'Strict', 'Non-Refundable'];

const EMPTY_FORM = {
  name: '',
  propertyType: PROPERTY_TYPES[0],
  unitNumber: '',
  listingVisibility: LISTING_VISIBILITIES[0],
  tenant: '',
  rent: '',
  status: 'Vacant',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  maxOccupancy: '',
  floorLevel: FLOOR_LEVELS[0],
  furnishingStatus: FURNISHING_STATUSES[0],
  location: '',
  streetAddress: '',
  city: '',
  region: '',
  neighborhood: '',
  postalCode: '',
  googleMapsLink: '',
  description: '',
  image: '',
  gallery: [],
  amenities: [],
  neighborhoodHighlights: [],
  billingCycle: BILLING_CYCLES[0],
  dailyRate: '',
  sixMonthRate: '',
  yearlyRate: '',
  securityDeposit: '',
  longStayDiscount: '',
  minimumStay: MINIMUM_STAYS[0],
  petPolicy: PET_POLICIES[0],
  smokingPolicy: SMOKING_POLICIES[0],
  cancellationPolicy: CANCELLATION_POLICIES[0],
  utilitiesIncluded: [],
  additionalNotes: '',
  availableFrom: '',
  videoTourUrl: '',
};

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div className="admin-apt-form__chipgroup">
      {options.map(([icon, name]) => {
        const active = selected.includes(name);
        return (
          <button
            type="button"
            key={name}
            className={`admin-apt-form__chip-toggle ${active ? 'is-active' : ''}`}
            onClick={() => onToggle(name)}
          >
            <span>{icon}</span><span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}

function ImageDropzone({ label, multiple, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await apiFetch('/uploads/image', { method: 'POST', body: formData });
        onUploaded(result.url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-apt-form__dropzone">
      <label className="admin-btn admin-btn-outline admin-apt-form__dropzone-btn">
        <FaCloudUploadAlt /> {uploading ? 'Uploading…' : label}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={uploading}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          hidden
        />
      </label>
      {error && <span className="admin-apt-form__dropzone-error">{error}</span>}
    </div>
  );
}

export default function ApartmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [galleryUrl, setGalleryUrl] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/apartments/${id}`)
      .then((apt) =>
        setForm({
          name: apt.name ?? '',
          propertyType: apt.propertyType ?? PROPERTY_TYPES[0],
          unitNumber: apt.unitNumber ?? '',
          listingVisibility: apt.listingVisibility ?? LISTING_VISIBILITIES[0],
          tenant: apt.tenant ?? '',
          rent: apt.rent ?? '',
          status: apt.status ?? 'Vacant',
          bedrooms: apt.bedrooms ?? '',
          bathrooms: apt.bathrooms ?? '',
          sqft: apt.sqft ?? '',
          maxOccupancy: apt.maxOccupancy ?? '',
          floorLevel: apt.floorLevel ?? FLOOR_LEVELS[0],
          furnishingStatus: apt.furnishingStatus ?? FURNISHING_STATUSES[0],
          location: apt.location ?? '',
          streetAddress: apt.streetAddress ?? '',
          city: apt.city ?? '',
          region: apt.region ?? '',
          neighborhood: apt.neighborhood ?? '',
          postalCode: apt.postalCode ?? '',
          googleMapsLink: apt.googleMapsLink ?? '',
          description: apt.description ?? '',
          image: apt.image ?? '',
          gallery: apt.gallery ?? [],
          amenities: apt.amenities ?? [],
          neighborhoodHighlights: apt.neighborhoodHighlights ?? [],
          billingCycle: apt.billingCycle ?? BILLING_CYCLES[0],
          dailyRate: apt.dailyRate ?? '',
          sixMonthRate: apt.sixMonthRate ?? '',
          yearlyRate: apt.yearlyRate ?? '',
          securityDeposit: apt.securityDeposit ?? '',
          longStayDiscount: apt.longStayDiscount ?? '',
          minimumStay: apt.minimumStay ?? MINIMUM_STAYS[0],
          petPolicy: apt.petPolicy ?? PET_POLICIES[0],
          smokingPolicy: apt.smokingPolicy ?? SMOKING_POLICIES[0],
          cancellationPolicy: apt.cancellationPolicy ?? CANCELLATION_POLICIES[0],
          utilitiesIncluded: apt.utilitiesIncluded ?? [],
          additionalNotes: apt.additionalNotes ?? '',
          availableFrom: apt.availableFrom ?? '',
          videoTourUrl: apt.videoTourUrl ?? '',
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleListValue = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  };

  const addGalleryUrl = () => {
    if (!galleryUrl.trim()) return;
    setForm((f) => ({ ...f, gallery: [...f.gallery, galleryUrl.trim()] }));
    setGalleryUrl('');
  };

  const removeGalleryUrl = (index) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const num = (v) => (v === '' ? undefined : Number(v));
      const payload = {
        name: form.name,
        propertyType: form.propertyType || undefined,
        unitNumber: form.unitNumber || undefined,
        listingVisibility: form.listingVisibility || undefined,
        tenant: form.tenant || null,
        rent: Number(form.rent) || 0,
        status: form.status,
        bedrooms: num(form.bedrooms),
        bathrooms: num(form.bathrooms),
        sqft: num(form.sqft),
        maxOccupancy: num(form.maxOccupancy),
        floorLevel: form.floorLevel || undefined,
        furnishingStatus: form.furnishingStatus || undefined,
        location: form.location || undefined,
        streetAddress: form.streetAddress || undefined,
        city: form.city || undefined,
        region: form.region || undefined,
        neighborhood: form.neighborhood || undefined,
        postalCode: form.postalCode || undefined,
        googleMapsLink: form.googleMapsLink || undefined,
        description: form.description || undefined,
        image: form.image || undefined,
        gallery: form.gallery,
        amenities: form.amenities,
        neighborhoodHighlights: form.neighborhoodHighlights,
        billingCycle: form.billingCycle || undefined,
        dailyRate: num(form.dailyRate),
        sixMonthRate: num(form.sixMonthRate),
        yearlyRate: num(form.yearlyRate),
        securityDeposit: num(form.securityDeposit),
        longStayDiscount: num(form.longStayDiscount),
        minimumStay: form.minimumStay || undefined,
        petPolicy: form.petPolicy || undefined,
        smokingPolicy: form.smokingPolicy || undefined,
        cancellationPolicy: form.cancellationPolicy || undefined,
        utilitiesIncluded: form.utilitiesIncluded,
        additionalNotes: form.additionalNotes || undefined,
        availableFrom: form.availableFrom || undefined,
        videoTourUrl: form.videoTourUrl || undefined,
      };
      if (isEdit) {
        await apiFetch(`/apartments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/apartments', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/admin/apartments');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-empty-state">Loading…</p>;

  return (
    <div className="admin-apt-form">
      <div className="admin-apt-form__head">
        <button type="button" className="admin-btn admin-btn-outline" onClick={() => navigate('/admin/apartments')}>
          <FaArrowLeft /> Back
        </button>
        <h2>{isEdit ? 'Edit Apartment' : 'Register Guest House / Apartment'}</h2>
        <button type="submit" form="apartment-form" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Apartment'}
        </button>
      </div>

      {error && <p className="admin-login__error">{error}</p>}

      <form id="apartment-form" onSubmit={handleSubmit} className="admin-apt-form__body">
        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Basic Information</h3>
          <div className="admin-apt-form__row admin-apt-form__row--3">
            <div className="admin-apt-form__field">
              <label>Unit Name</label>
              <input className="admin-input" required value={form.name} onChange={update('name')} placeholder="e.g. Sunset Guest House - Unit 4B" />
            </div>
            <div className="admin-apt-form__field">
              <label>Property Type</label>
              <select className="admin-select" value={form.propertyType} onChange={update('propertyType')}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Status</label>
              <select className="admin-select" value={form.status} onChange={update('status')}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-apt-form__row admin-apt-form__row--3">
            <div className="admin-apt-form__field">
              <label>Unit / Floor Number</label>
              <input className="admin-input" value={form.unitNumber} onChange={update('unitNumber')} placeholder="e.g. Unit 4B, Floor 2" />
            </div>
            <div className="admin-apt-form__field">
              <label>Tenant</label>
              <input className="admin-input" value={form.tenant} onChange={update('tenant')} placeholder="Vacant" />
            </div>
            <div className="admin-apt-form__field">
              <label>Listing Visibility</label>
              <select className="admin-select" value={form.listingVisibility} onChange={update('listingVisibility')}>
                {LISTING_VISIBILITIES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Location</h3>
          <div className="admin-apt-form__row admin-apt-form__row--1">
            <div className="admin-apt-form__field">
              <label>Street Address</label>
              <input className="admin-input" value={form.streetAddress} onChange={update('streetAddress')} placeholder="123 Palm Grove Road" />
            </div>
          </div>
          <div className="admin-apt-form__row admin-apt-form__row--4">
            <div className="admin-apt-form__field">
              <label>City</label>
              <input className="admin-input" value={form.city} onChange={update('city')} placeholder="Kigali" />
            </div>
            <div className="admin-apt-form__field">
              <label>State / Region</label>
              <input className="admin-input" value={form.region} onChange={update('region')} placeholder="Kigali City" />
            </div>
            <div className="admin-apt-form__field">
              <label>Neighborhood</label>
              <input className="admin-input" value={form.neighborhood} onChange={update('neighborhood')} placeholder="e.g. Kacyiru" />
            </div>
            <div className="admin-apt-form__field">
              <label>Postal Code</label>
              <input className="admin-input" value={form.postalCode} onChange={update('postalCode')} placeholder="00100" />
            </div>
          </div>
          <div className="admin-apt-form__row admin-apt-form__row--1">
            <div className="admin-apt-form__field">
              <label>Location (public display)</label>
              <input className="admin-input" value={form.location} onChange={update('location')} placeholder="Neighborhood / address shown to visitors" />
            </div>
          </div>
          <div className="admin-apt-form__row admin-apt-form__row--1">
            <div className="admin-apt-form__field">
              <label>Google Maps Link</label>
              <input className="admin-input" value={form.googleMapsLink} onChange={update('googleMapsLink')} placeholder="https://maps.google.com/…" />
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Room Details</h3>
          <div className="admin-apt-form__row admin-apt-form__row--4">
            <div className="admin-apt-form__field">
              <label>Bedrooms</label>
              <input className="admin-input" type="number" min="0" value={form.bedrooms} onChange={update('bedrooms')} placeholder="2" />
            </div>
            <div className="admin-apt-form__field">
              <label>Bathrooms</label>
              <input className="admin-input" type="number" min="0" value={form.bathrooms} onChange={update('bathrooms')} placeholder="1" />
            </div>
            <div className="admin-apt-form__field">
              <label>Square Feet</label>
              <input className="admin-input" type="number" min="0" value={form.sqft} onChange={update('sqft')} placeholder="850" />
            </div>
            <div className="admin-apt-form__field">
              <label>Max Occupancy</label>
              <input className="admin-input" type="number" min="1" value={form.maxOccupancy} onChange={update('maxOccupancy')} placeholder="4" />
            </div>
          </div>
          <div className="admin-apt-form__row admin-apt-form__row--2">
            <div className="admin-apt-form__field">
              <label>Floor Level</label>
              <select className="admin-select" value={form.floorLevel} onChange={update('floorLevel')}>
                {FLOOR_LEVELS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Furnishing Status</label>
              <select className="admin-select" value={form.furnishingStatus} onChange={update('furnishingStatus')}>
                {FURNISHING_STATUSES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Amenities</h3>
          <p className="admin-apt-form__hint">Select everything included with this unit</p>
          <ChipGroup options={AMENITY_OPTIONS} selected={form.amenities} onToggle={(v) => toggleListValue('amenities', v)} />
        </section>

        <section className="admin-card admin-apt-form__section">
          <div className="admin-apt-form__section-head">
            <h3>Pricing</h3>
            <div className="admin-apt-form__field admin-apt-form__field--inline">
              <label>Preferred billing cycle</label>
              <select className="admin-select" value={form.billingCycle} onChange={update('billingCycle')}>
                {BILLING_CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-apt-form__pricing-tiers">
            <div className="admin-apt-form__pricing-tier">
              <label>Daily Rate</label>
              <input className="admin-input" type="number" min="0" value={form.dailyRate} onChange={update('dailyRate')} placeholder="45" />
            </div>
            <div className="admin-apt-form__pricing-tier">
              <label>Monthly Rate</label>
              <input className="admin-input" type="number" min="0" required value={form.rent} onChange={update('rent')} placeholder="1200" />
            </div>
            <div className="admin-apt-form__pricing-tier">
              <label>6-Month Rate</label>
              <input className="admin-input" type="number" min="0" value={form.sixMonthRate} onChange={update('sixMonthRate')} placeholder="6800" />
            </div>
            <div className="admin-apt-form__pricing-tier">
              <label>Yearly Rate</label>
              <input className="admin-input" type="number" min="0" value={form.yearlyRate} onChange={update('yearlyRate')} placeholder="13000" />
            </div>
          </div>

          <div className="admin-apt-form__row admin-apt-form__row--2">
            <div className="admin-apt-form__field">
              <label>Security Deposit ($)</label>
              <input className="admin-input" type="number" min="0" value={form.securityDeposit} onChange={update('securityDeposit')} placeholder="500" />
            </div>
            <div className="admin-apt-form__field">
              <label>Long-Stay Discount (%)</label>
              <input className="admin-input" type="number" min="0" value={form.longStayDiscount} onChange={update('longStayDiscount')} placeholder="10" />
            </div>
          </div>
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Description</h3>
          <textarea
            className="admin-textarea"
            rows="5"
            value={form.description}
            onChange={update('description')}
            placeholder="Describe the unit — layout, natural light, standout features…"
          />
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Photos</h3>
          <div className="admin-apt-form__field">
            <label>Main Image</label>
            <div className="admin-apt-form__image-row">
              {form.image && <img className="admin-apt-form__thumb" src={form.image} alt="Main" />}
              <input className="admin-input" value={form.image} onChange={update('image')} placeholder="https://…" />
              <ImageDropzone label="Upload" onUploaded={(url) => setForm((f) => ({ ...f, image: url }))} />
            </div>
          </div>

          <div className="admin-apt-form__field">
            <label>Gallery</label>
            <div className="admin-apt-form__inline-add">
              <input
                className="admin-input"
                value={galleryUrl}
                onChange={(e) => setGalleryUrl(e.target.value)}
                placeholder="Image URL"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl(); } }}
              />
              <button type="button" className="admin-btn admin-btn-outline" onClick={addGalleryUrl}>
                <FaPlus /> Add
              </button>
              <ImageDropzone
                label="Upload"
                multiple
                onUploaded={(url) => setForm((f) => ({ ...f, gallery: [...f.gallery, url] }))}
              />
            </div>
            {form.gallery.length > 0 && (
              <ul className="admin-apt-form__list">
                {form.gallery.map((url, i) => (
                  <li key={i}>
                    <img className="admin-apt-form__thumb admin-apt-form__thumb--sm" src={url} alt="" />
                    <span className="admin-apt-form__list-text">{url}</span>
                    <button type="button" onClick={() => removeGalleryUrl(i)} aria-label="Remove">
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-apt-form__field">
            <label>Video Tour URL (optional)</label>
            <input className="admin-input" value={form.videoTourUrl} onChange={update('videoTourUrl')} placeholder="https://…" />
          </div>
        </section>

        <section className="admin-card admin-apt-form__section admin-apt-form__section--half">
          <h3>Neighborhood Highlights</h3>
          <p className="admin-apt-form__hint">What's nearby that renters will love</p>
          <ChipGroup options={HIGHLIGHT_OPTIONS} selected={form.neighborhoodHighlights} onToggle={(v) => toggleListValue('neighborhoodHighlights', v)} />
        </section>

        <section className="admin-card admin-apt-form__section">
          <h3>Lease Terms &amp; Policies</h3>
          <div className="admin-apt-form__row admin-apt-form__row--4">
            <div className="admin-apt-form__field">
              <label>Minimum Stay</label>
              <select className="admin-select" value={form.minimumStay} onChange={update('minimumStay')}>
                {MINIMUM_STAYS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Pet Policy</label>
              <select className="admin-select" value={form.petPolicy} onChange={update('petPolicy')}>
                {PET_POLICIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Smoking Policy</label>
              <select className="admin-select" value={form.smokingPolicy} onChange={update('smokingPolicy')}>
                {SMOKING_POLICIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="admin-apt-form__field">
              <label>Cancellation Policy</label>
              <select className="admin-select" value={form.cancellationPolicy} onChange={update('cancellationPolicy')}>
                {CANCELLATION_POLICIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-apt-form__row admin-apt-form__row--1">
            <div className="admin-apt-form__field">
              <label>Available From</label>
              <input className="admin-input" value={form.availableFrom} onChange={update('availableFrom')} placeholder="e.g. Available now" />
            </div>
          </div>

          <p className="admin-apt-form__hint admin-apt-form__hint--label">Utilities Included</p>
          <ChipGroup options={UTILITY_OPTIONS} selected={form.utilitiesIncluded} onToggle={(v) => toggleListValue('utilitiesIncluded', v)} />

          <div className="admin-apt-form__field admin-apt-form__field--notes">
            <label>Additional Notes</label>
            <textarea
              className="admin-textarea"
              rows="3"
              value={form.additionalNotes}
              onChange={update('additionalNotes')}
              placeholder="Any other lease terms, house rules, or conditions…"
            />
          </div>
        </section>

        <div className="admin-apt-form__footer">
          <button type="button" className="admin-btn admin-btn-outline" onClick={() => navigate('/admin/apartments')}>
            Cancel
          </button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Apartment'}
          </button>
        </div>
      </form>
    </div>
  );
}
