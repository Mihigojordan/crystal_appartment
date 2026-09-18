import { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import { apiFetch } from '../lib/apiClient';
import './Contact.css';

const info = [
  {
    icon: <FaMapMarkerAlt />,
    title: 'Address',
    text: '34CV+R5, Kimironko, Kigali, Rwanda',
    href: 'https://maps.app.goo.gl/YhhsYvj4yhe4rhTq9',
    external: true,
  },
  {
    icon: <FaPhoneAlt />,
    title: 'Phone',
    text: '+250 784 754 294',
    href: 'tel:+250784754294',
  },
  {
    icon: <FaEnvelope />,
    title: 'Email',
    text: 'hello@crystalapartment.com',
  },
  {
    icon: <FaClock />,
    title: 'Office Hours',
    text: 'Mon - Sat, 8:00 AM - 6:00 PM',
  },
];

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(EMPTY_FORM);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">Get In Touch</span>
          <h2 className="section-title">Contact Crystal Apartment</h2>
          <p>Have a question or want to schedule a tour? Reach out and our team will respond shortly.</p>
        </div>

        <div className="contact__grid">
          <div className="contact__info">
            {info.map((item) => (
              <div className="contact__info-card" key={item.title}>
                <div className="contact__info-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="contact__info-link"
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="contact__map">
              <iframe
                title="Crystal Apartment location"
                src="https://maps.google.com/maps?q=34CV%2BR5+Kimironko,+Kigali,+Rwanda&z=16&output=embed"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__form-row">
              <div className="contact__field">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={update('name')}
                />
              </div>
              <div className="contact__field">
                <label htmlFor="contact-phone">Phone</label>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
            </div>

            <div className="contact__field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={update('email')}
              />
            </div>

            <div className="contact__field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows="5"
                placeholder="Tell us what you're looking for"
                required
                value={form.message}
                onChange={update('message')}
              />
            </div>

            {error && <p className="contact__form-error">{error}</p>}
            {sent && !error && (
              <p className="contact__form-success">Thanks — your message has been sent. We'll be in touch soon.</p>
            )}

            <button type="submit" className="btn btn-primary contact__submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
