import PageHeader from '../components/PageHeader';
import Listings from '../components/Listings';

export default function ApartmentsPage() {
  return (
    <>
      <PageHeader
        title="Apartments"
        subtitle="Browse available homes, hand-picked and updated daily across our communities."
      />
      <Listings />
    </>
  );
}
