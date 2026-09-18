import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApartmentDetail from '../components/ApartmentDetail';
import { apiFetch } from '../lib/apiClient';

export default function ApartmentDetailPage() {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setApartment(null);
    setError('');
    apiFetch(`/apartments/public/${id}`)
      .then(setApartment)
      .catch((err) => setError(err.message));
  }, [id]);

  return <ApartmentDetail apartment={apartment} error={error} />;
}
