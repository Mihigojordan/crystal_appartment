import { useEffect, useState } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Teri Dactyl',
    role: 'Resident, Maple Court Suite',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop',
    text: "It won't be easy, but renting my own place has been a lifelong dream, and knowing that I'll only get out of it what I put into it, I'm ready to make it feel like home from day one.",
  },
  {
    name: 'Elmer Harvy',
    role: 'Resident, The Willow Loft',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    text: 'To rent a nice apartment is to choose a better way of life. Choosing that better way means working toward well-being, and isn’t well-being what’s paramount in the end.',
  },
  {
    name: 'Marcus Reed',
    role: 'Resident, Cedar Heights Studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    text: 'The ability to track maintenance requests directly from the app makes everything so streamlined. Life before Crystal Apartment was chaotic — now every request gets handled fast.',
  },
  {
    name: 'Aline Uwase',
    role: 'Resident, Maple Court Suite',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    text: 'From the first tour to move-in day, the team made everything effortless. Our apartment feels like home, and the community here is genuinely welcoming.',
  },
];

function TestimonialCard({ data, active }) {
  return (
    <div className={`testimonial-card ${active ? 'testimonial-card--active' : ''}`}>
      <FaQuoteLeft className="testimonial-card__quote" />
      <p className="testimonial-card__text">{data.text}</p>
      <div className="testimonial-card__person">
        <img src={data.avatar} alt={data.name} />
        <div>
          <h4>{data.name}</h4>
          <span>{data.role}</span>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const len = testimonials.length;

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % len), 6000);
    return () => clearInterval(timer);
  }, [len]);

  const prev = testimonials[(index - 1 + len) % len];
  const current = testimonials[index];
  const next = testimonials[(index + 1) % len];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title testimonials__title">What People Say</h2>
          <p>Real experiences from residents who now call Crystal Apartment home.</p>
        </div>

        <div className="testimonials__row">
          <TestimonialCard data={prev} />
          <TestimonialCard data={current} active />
          <TestimonialCard data={next} />
        </div>

        <div className="testimonials__dots">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              className={`testimonials__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial from ${t.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
