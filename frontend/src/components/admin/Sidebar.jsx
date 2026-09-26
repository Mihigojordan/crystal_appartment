import { NavLink } from 'react-router-dom';
import {
  FaChartPie,
  FaBuilding,
  FaCalendarCheck,
  FaRoute,
  FaEnvelope,
  FaMoneyBillWave,
  FaChartBar,
  FaGlobe,
  FaClipboardList,
  FaUserCircle,
} from 'react-icons/fa';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/admin/overview', label: 'Overview', icon: FaChartPie },
  { to: '/admin/apartments', label: 'Apartments', icon: FaBuilding },
  { to: '/admin/bookings', label: 'Bookings', icon: FaCalendarCheck },
  { to: '/admin/payments', label: 'Payments', icon: FaMoneyBillWave },
  { to: '/admin/tours', label: 'Tour Requests', icon: FaRoute },
  { to: '/admin/messages', label: 'Messages', icon: FaEnvelope },
  { to: '/admin/reports', label: 'Reports', icon: FaChartBar },
  { to: '/admin/visitors', label: 'Website Visitors', icon: FaGlobe },
  { to: '/admin/logs', label: 'Logs', icon: FaClipboardList },
  { to: '/admin/profile', label: 'Profile', icon: FaUserCircle },
];

export default function Sidebar({ expanded }) {
  return (
    <aside className={`admin-sidebar ${expanded ? '' : 'is-collapsed'}`}>
      <nav className="admin-sidebar__nav">
        {expanded && <p className="admin-sidebar__section-label">Menu</p>}
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `admin-sidebar__link ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="admin-sidebar__icon">
              <Icon />
            </span>
            {expanded && <span className="admin-sidebar__label">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
