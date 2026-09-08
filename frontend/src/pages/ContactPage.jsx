import PageHeader from '../components/PageHeader';
import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Have a question or want to schedule a tour? Reach out and our team will respond shortly."
      />
      <Contact />
    </>
  );
}
