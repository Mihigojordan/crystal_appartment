import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useCurrency } from '../context/useCurrency';
import logo from '../assets/logo.png';
import './Navbar.css';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Rental Stays', to: '/apartments' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <img src={logo} alt="Crystal Rental Stay" className="navbar__logo" />
        </NavLink>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          <ul>
            {links.map((l) => (
              <li key={l.label}>
                <NavLink to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <div className="navbar__currency" role="group" aria-label="Currency">
            <button
              type="button"
              className={currency === 'USD' ? 'is-active' : ''}
              onClick={() => setCurrency('USD')}
            >
              USD
            </button>
            <button
              type="button"
              className={currency === 'RWF' ? 'is-active' : ''}
              onClick={() => setCurrency('RWF')}
            >
              RWF
            </button>
          </div>
          <NavLink to="/apartments" className="btn btn-primary navbar__book">Explore Our Rental Stays</NavLink>
          <button className="navbar__toggle" onClick={() => setOpen((o) => !o)} aria-label="menu">
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
}
