import { useEffect, useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import gateCloseup from '../assets/image5.jpg';
import exteriorWide from '../assets/hero.jpg';
import gateDusk from '../assets/M-M_001.jpg';
import livingDining from '../assets/image4.jpg';
import diningTv from '../assets/image2.jpg';
import kitchen from '../assets/image3.jpg';
import mapleCourt from '../assets/M-M_003.jpg';
import willowLoft from '../assets/M-M_013.jpg';
import cedarHeights from '../assets/M-M_017.jpg';
import './Gallery.css';

const photos = [
  { image: gateCloseup, title: 'Entrance Gate', caption: 'Custom-cut security gate' },
  { image: exteriorWide, title: 'The Building', caption: 'Modern exterior at night' },
  { image: livingDining, title: 'Living & Dining', caption: 'Comfortable lounge seating' },
  { image: mapleCourt, title: 'Maple Court Suite', caption: 'Downtown District' },
  { image: gateDusk, title: 'Dusk Arrival', caption: 'Golden hour at the entrance' },
  { image: kitchen, title: 'Kitchen', caption: 'Fully equipped kitchen' },
  { image: willowLoft, title: 'The Willow Loft', caption: 'Riverside Green' },
  { image: diningTv, title: 'Dining & TV Area', caption: 'Open dining with entertainment' },
  { image: cedarHeights, title: 'Cedar Heights Studio', caption: 'Uptown Village' },
];

export default function Gallery() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (active === null) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + photos.length) % photos.length);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return (
    <section className="gallery-grid">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Photo Gallery</span>
          <h2 className="section-title">Every Corner of Crystal Apartment</h2>
          <p>Interiors, exteriors, and the finished suites &mdash; browse the full collection.</p>
        </div>

        <div className="gallery-grid__masonry">
          {photos.map((p, i) => (
            <button
              type="button"
              className="gallery-grid__item"
              key={p.title}
              onClick={() => setActive(i)}
            >
              <img src={p.image} alt={p.title} loading="lazy" />
              <span className="gallery-grid__overlay">
                <FaExpand />
                <h4>{p.title}</h4>
                <span>{p.caption}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {active !== null && (
        <div className="gallery-grid__lightbox" onClick={() => setActive(null)}>
          <button
            type="button"
            className="gallery-grid__close"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            <FaTimes />
          </button>

          <button
            type="button"
            className="gallery-grid__nav gallery-grid__nav--prev"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setActive((i) => (i - 1 + photos.length) % photos.length);
            }}
          >
            <FaChevronLeft />
          </button>

          <figure className="gallery-grid__lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={photos[active].image} alt={photos[active].title} />
            <figcaption>
              <h4>{photos[active].title}</h4>
              <span>{photos[active].caption}</span>
            </figcaption>
          </figure>

          <button
            type="button"
            className="gallery-grid__nav gallery-grid__nav--next"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setActive((i) => (i + 1) % photos.length);
            }}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  );
}
