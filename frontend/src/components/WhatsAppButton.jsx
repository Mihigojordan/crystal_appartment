import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  return (
    <a
      href="https://api.whatsapp.com/send?phone=250784754294&text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20your%20rental%20stays."
      target="_blank"
      rel="noreferrer"
      className="whatsapp-btn"
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
}
