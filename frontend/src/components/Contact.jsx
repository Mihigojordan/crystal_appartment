import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';
import './Contact.css';

const info = [
  {
    icon: <FaMapMarkerAlt />,
    title: 'Address',
    text: 'KG 9 Ave, Kimihurura, Kigali, Rwanda',
  },
  {
    icon: <FaPhoneAlt />,
    title: 'Phone',
    text: '+250 788 000 000',
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

export default function Contact() {
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
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            <div className="contact__map">
              <iframe
                title="Crystal Apartment location"
                src="https://maps.google.com/maps?q=Kimihurura,Kigali,Rwanda&z=14&output=embed"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
            <div className="contact__form-row">
              <div className="contact__field">
                <label htmlFor="contact-name">Full Name</label>
                <input id="contact-name" type="text" placeholder="Your name" required />
              </div>
              <div className="contact__field">
                <label htmlFor="contact-phone">Phone</label>
                <input id="contact-phone" type="tel" placeholder="Your phone number" />
              </div>
            </div>

            <div className="contact__field">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="contact__field">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" rows="5" placeholder="Tell us what you're looking for" required />
            </div>

            <button type="submit" className="btn btn-primary contact__submit">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
