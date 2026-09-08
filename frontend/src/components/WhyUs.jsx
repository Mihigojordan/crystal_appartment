import { FaAward, FaClock, FaHeart, FaMapMarkerAlt } from 'react-icons/fa';
import whyUsImg from '../assets/M-M_001.jpg';
import './WhyUs.css';

const points = [
  { icon: <FaAward />, title: 'Trusted for 15+ Years', desc: 'A long-standing reputation for quality housing and honest service.' },
  { icon: <FaClock />, title: '24/7 Support', desc: 'Our team is always reachable for emergencies and quick questions.' },
  { icon: <FaHeart />, title: 'Community First', desc: 'Thoughtfully designed spaces that bring neighbors together.' },
  { icon: <FaMapMarkerAlt />, title: 'Prime Locations', desc: 'Close to transit, shopping, and dining in every neighborhood we serve.' },
];

export default function WhyUs() {
  return (
    <section id="amenities" className="whyus">
      <div className="container whyus__grid">
        <div className="whyus__image">
          <img src={whyUsImg} alt="Crystal Apartment building" />
        </div>

        <div className="whyus__content">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-title">Comfort, Trust & Community</h2>
          <p className="whyus__lead">
            Crystal Apartment has been welcoming residents home for over a decade, pairing
            timeless architecture with the amenities modern life demands.
          </p>

          <div className="whyus__points">
            {points.map((p) => (
              <div className="whyus__point" key={p.title}>
                <span className="whyus__icon">{p.icon}</span>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
