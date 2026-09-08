import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Navbar.css';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Apartments', to: '/apartments' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <img src={logo} alt="Crystal Apartment" className="navbar__logo" />
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
          <NavLink to="/contact" className="btn btn-primary navbar__book">Book Apartment</NavLink>
          <button className="navbar__toggle" onClick={() => setOpen((o) => !o)} aria-label="menu">
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
}
