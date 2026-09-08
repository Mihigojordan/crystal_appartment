import Hero from '../components/Hero';
import Services from '../components/Services';
import PropertyOfDay from '../components/PropertyOfDay';
import Listings from '../components/Listings';
import WhyUs from '../components/WhyUs';
import ApartmentTour from '../components/ApartmentTour';
import AppPromo from '../components/AppPromo';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <PropertyOfDay />
      <Listings />
      <WhyUs />
      <ApartmentTour />
      <AppPromo />
      <Testimonials />
    </>
  );
}
