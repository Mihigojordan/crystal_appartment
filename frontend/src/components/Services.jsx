import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaDollarSign,
  FaCog,
  FaBell,
  FaBookOpen,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTools,
  FaTimes,
} from 'react-icons/fa';
import './Services.css';

const services = [
  {
    icon: <FaHome />,
    title: 'Property Management',
    desc: 'Property management is the control, maintenance and upkeep of every unit and shared space.',
    details:
      'Our on-site management team handles everything from day-to-day upkeep to long-term building care, so residents never have to chase down a fix themselves. Common areas are inspected weekly, service requests are logged and tracked to completion, and every unit is prepared to the same high standard between tenants.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaDollarSign />,
    title: 'Flexible Payment Plans',
    desc: 'Choose monthly, quarterly, or annual payment plans that fit your budget and schedule.',
    details:
      'We know rent is easier to manage when it fits your cash flow. Pick monthly, quarterly, or annual billing at signing, switch plans at renewal, and pay online by card or bank transfer with automatic receipts for every payment.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaCog />,
    title: 'Utilities & Setup',
    desc: 'We help new residents get water, power, and internet connected before move-in day.',
    details:
      'Move-in day should feel like coming home, not filing paperwork. Our team pre-arranges water, electricity, and internet activation, and walks you through meter readings and provider contacts so every utility is live before you unpack the first box.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaBell />,
    title: 'Important Notifications',
    desc: 'Stay updated on lease renewals, maintenance visits, and community announcements.',
    details:
      'Never be caught off guard by a lease deadline or a scheduled water shutoff again. Residents get advance notice of renewals, planned maintenance, and community announcements by email and SMS, with reminders as key dates approach.',
    image: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaBookOpen />,
    title: 'Transparent Leasing',
    desc: 'Clear contracts and pricing with no hidden fees, explained in plain language upfront.',
    details:
      'Every fee is listed before you sign, not discovered afterward. Our lease agreements are written in plain language, walked through line by line with a leasing agent, and you leave with a full copy and an itemized breakdown of costs.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaMapMarkerAlt />,
    title: 'Neighborhood Guide',
    desc: 'Find nearby schools, transit, groceries, and restaurants around every property.',
    details:
      'Settling into a new area is easier with a map in hand. Every listing comes with a curated guide to nearby schools, transit stops, grocery stores, and restaurants, plus walking-distance estimates so you know the neighborhood before you move in.',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaShieldAlt />,
    title: '24/7 Security',
    desc: 'Round-the-clock monitoring, gated access, and on-call staff for total peace of mind.',
    details:
      'Safety runs around the clock, not just during business hours. Every property has gated and key-card access, CCTV coverage on common areas, and on-call security staff residents can reach any hour of the night.',
    image: 'https://images.unsplash.com/photo-1558002038-bb4237b290c4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <FaTools />,
    title: 'Maintenance & Repairs',
    desc: 'Submit a request and our maintenance team responds fast, day or night.',
    details:
      'A leaky faucet or tripped breaker shouldn’t wait days. Submit a request through the resident portal and our in-house maintenance team triages and responds fast, with emergency call-outs available around the clock.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function Services() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (active === null) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title services__title">Property Services</h2>
          <p>Everything you need to rent, settle in, and enjoy life at Crystal Apartment.</p>
        </div>

        <div className="services__grid">
          {services.map((s, i) => (
            <button
              type="button"
              className="services__card"
              key={s.title}
              onClick={() => setActive(i)}
            >
              <div className="services__icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {active !== null && (
        <div className="services__modal" onClick={() => setActive(null)}>
          <div className="services__modal-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="services__modal-close"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              <FaTimes />
            </button>

            <div className="services__modal-image">
              <img src={services[active].image} alt={services[active].title} />
            </div>

            <div className="services__modal-body">
              <div className="services__icon services__modal-icon">{services[active].icon}</div>
              <h3>{services[active].title}</h3>
              <p>{services[active].details}</p>
              <Link to="/contact" className="btn btn-primary" onClick={() => setActive(null)}>
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
