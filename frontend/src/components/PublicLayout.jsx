import { Outlet } from 'react-router-dom';
import { CurrencyProvider } from '../context/CurrencyContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import WhatsAppButton from './WhatsAppButton';

export default function PublicLayout() {
  return (
    <CurrencyProvider>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
      <WhatsAppButton />
    </CurrencyProvider>
  );
}
