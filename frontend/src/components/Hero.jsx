import { Link } from 'react-router-dom';
import { FaHome, FaCalendarCheck, FaKey } from 'react-icons/fa';
import heroImg from '../assets/hero.jpg';
import './Hero.css';

const quickLinks = [
  { icon: <FaHome />, label: 'Rental Stays', to: '/apartments' },
  { icon: <FaCalendarCheck />, label: 'Booking', to: '/contact' },
  { icon: <FaKey />, label: 'Amenities', to: '/about' },
];

export default function Hero() {
  return (
    <section id="home" className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="hero__overlay" />
      <div className="container hero__content">
        <p className="hero__signature">Crystal Rental Stay</p>
        <p className="hero__kicker">Looking for a place to call home?</p>
        <h1 className="hero__title">Discover Your Perfect Stay</h1>
        <p className="hero__desc">
          Spacious, light-filled rental stays in the heart of the city. From cozy singles to
          family-sized suites, Crystal Rental Stay blends timeless design with modern comfort.
        </p>
        <Link to="/apartments" className="btn btn-primary hero__cta">Explore Rental Stays</Link>

        <div className="hero__quicklinks">
          {quickLinks.map((q) => (
            <Link to={q.to} className="hero__quickcard" key={q.label}>
              <span className="hero__quickicon">{q.icon}</span>
              <span>{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <svg className="hero__torn" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path
          d="M0,80 L0,40 L20,55 L45,20 L70,50 L95,10 L120,45 L150,25 L175,60 L205,15
             L230,48 L260,30 L285,58 L315,20 L340,50 L370,12 L395,45 L425,28 L450,60
             L480,18 L505,50 L535,22 L560,55 L590,10 L615,45 L645,30 L670,58 L700,20
             L725,48 L755,15 L780,50 L810,28 L835,60 L865,18 L890,45 L920,25 L945,55
             L975,12 L1000,48 L1030,22 L1055,58 L1085,15 L1110,50 L1140,25 L1165,55
             L1200,30 L1200,80 Z"
        />
      </svg>
    </section>
  );
}
