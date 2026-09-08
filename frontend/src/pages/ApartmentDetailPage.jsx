import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ApartmentDetail from '../components/ApartmentDetail';
import { getListingById } from '../data/listings';

export default function ApartmentDetailPage() {
  const { id } = useParams();
  const listing = getListingById(id);

  return (
    <>
      <PageHeader
        title={listing ? listing.title : 'Apartment'}
        subtitle={listing ? `${listing.location} — ${listing.price}` : undefined}
      />
      <ApartmentDetail />
    </>
  );
}
