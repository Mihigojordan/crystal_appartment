import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPaperPlane,
  FaArrowUp,
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Footer.css';

const highlights = [
  {
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=300&auto=format&fit=crop',
    title: 'Real Estate Industry',
    desc: 'An electronic version of the real estate industry.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop',
    title: 'Entertaining Spaces',
    desc: 'This home provides wonderful entertaining spaces.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=300&auto=format&fit=crop',
    title: 'Estate Agents Work',
    desc: 'The market of buying and selling real estate.',
  },
];

export default function Footer() {
  const [slide, setSlide] = useState(0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand-card">
          <Link to="/" className="footer__logo">
            <img src={logo} alt="Crystal Apartment logo" />
          </Link>
          <h3>CRYSTAL APARTMENT</h3>
          <p>Timeless apartment living with modern comfort.</p>
        </div>

        <div className="footer__col footer__col--links">
          <h4>Useful Links</h4>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/apartments">New Arrivals</Link></li>
            <li><Link to="/services">Agency</Link></li>
            <li><Link to="/contact">Faq</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Feature</h4>
          <ul>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/services">Agency</Link></li>
            <li><Link to="/about">Agents</Link></li>
            <li><Link to="/apartments">Pricing</Link></li>
            <li><Link to="/apartments">Favourites</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Gallery</h4>
          <ul>
            <li><Link to="/gallery">Interiors</Link></li>
            <li><Link to="/gallery">Exteriors</Link></li>
            <li><Link to="/about">Amenities</Link></li>
            <li><Link to="/gallery">Floor Plans</Link></li>
            <li><Link to="/gallery">Videos</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Social</h4>
          <ul>
            <li><a href="#"><FaFacebookF /> Facebook</a></li>
            <li><a href="#"><FaInstagram /> Instagram</a></li>
            <li><a href="#"><FaTwitter /> Twitter</a></li>
            <li><a href="#">Gmail</a></li>
          </ul>
        </div>

        <div className="footer__col footer__subscribe">
          <h4>Subscribe</h4>
          <p>
            Real estate investing involves the purchase, improvement of realty, management
            and sale or rental of real estate for profit.
          </p>
          <form className="footer__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email Address" required />
            <button type="submit" aria-label="Subscribe">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>

      <div className="container footer__highlights">
        {highlights.map((item) => (
          <div className="footer__highlight" key={item.title}>
            <img src={item.image} alt={item.title} />
            <div>
              <h5>{item.title.toUpperCase()}</h5>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="footer__dots">
        {highlights.map((item, i) => (
          <button
            key={item.title}
            className={`footer__dot ${i === slide ? 'is-active' : ''}`}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Crystal Apartment. All rights reserved.</p>
      </div>

      <button className="footer__totop" onClick={scrollToTop} aria-label="Back to top">
        <FaArrowUp />
      </button>
    </footer>
  );
}
