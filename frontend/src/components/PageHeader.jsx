import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.jpg';
import './PageHeader.css';

export default function PageHeader({ title, subtitle }) {
  return (
    <section className="page-header" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="page-header__overlay" />
      <div className="container page-header__content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        <div className="page-header__crumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
      </div>
    </section>
  );
}
