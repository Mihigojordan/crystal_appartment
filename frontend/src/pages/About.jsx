import PageHeader from '../components/PageHeader';
import OurStory from '../components/OurStory';
import WhyUs from '../components/WhyUs';
import Testimonials from '../components/Testimonials';

export default function About() {
  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Timeless apartment living with modern comfort, built on trust and community."
      />
      <OurStory />
      <WhyUs />
      <Testimonials />
    </>
  );
}
