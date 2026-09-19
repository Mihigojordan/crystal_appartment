import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './components/PublicLayout';
import PrivateRoute from './components/PrivateRoute';
import RouteTracker from './components/RouteTracker';
import Home from './pages/Home';
import About from './pages/About';
import ServicesPage from './pages/ServicesPage';
import ApartmentsPage from './pages/ApartmentsPage';
import ApartmentDetailPage from './pages/ApartmentDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/admin/Login';
import Overview from './pages/admin/Overview';
import Apartments from './pages/admin/Apartments';
import ApartmentForm from './pages/admin/ApartmentForm';
import ApartmentView from './pages/admin/ApartmentView';
import Tenants from './pages/admin/Tenants';
import TenantForm from './pages/admin/TenantForm';
import Bookings from './pages/admin/Bookings';
import BookingView from './pages/admin/BookingView';
import Payments from './pages/admin/Payments';
import TourRequests from './pages/admin/TourRequests';
import Messages from './pages/admin/Messages';
import Reports from './pages/admin/Reports';
import PredictionCenter from './pages/admin/PredictionCenter';
import Visitors from './pages/admin/Visitors';
import Logs from './pages/admin/Logs';
import Profile from './pages/admin/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteTracker />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/apartments/:id" element={<ApartmentDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="apartments" element={<Apartments />} />
              <Route path="apartments/new" element={<ApartmentForm />} />
              <Route path="apartments/:id" element={<ApartmentView />} />
              <Route path="apartments/:id/edit" element={<ApartmentForm />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenants/new" element={<TenantForm />} />
              <Route path="tenants/:id/edit" element={<TenantForm />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="bookings/:id" element={<BookingView />} />
              <Route path="payments" element={<Payments />} />
              <Route path="tours" element={<TourRequests />} />
              <Route path="messages" element={<Messages />} />
              <Route path="reports" element={<Reports />} />
              <Route path="predictions" element={<PredictionCenter />} />
              <Route path="visitors" element={<Visitors />} />
              <Route path="logs" element={<Logs />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
