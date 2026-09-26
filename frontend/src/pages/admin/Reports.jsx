import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import './Overview.css';

const currency = (n) => `$${n.toLocaleString()}`;

function BreakdownList({ entries }) {
  return (
    <ul className="admin-overview__list">
      {entries.map(([label, value]) => (
        <li key={label}>
          <span>{label}</span>
          <span>{value}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/dashboard/reports').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="admin-empty-state">{error}</p>;
  if (!data) return <p className="admin-empty-state">Loading…</p>;

  const { occupancy, revenue, bookings, tenants } = data;

  return (
    <div className="admin-overview">
      <h2>Reports</h2>
      <p className="admin-text-muted">Snapshot across apartments, tenants, bookings and payments</p>

      <div className="admin-card">
        <h3>Occupancy</h3>
        <div className="admin-stat-grid">
          <StatCard label="Total Apartments" value={occupancy.totalApartments} />
          <StatCard label="Occupied" value={occupancy.occupied} accent />
          <StatCard label="Vacant" value={occupancy.vacant} />
          <StatCard label="Maintenance" value={occupancy.maintenance} />
          <StatCard label="Occupancy Rate" value={`${occupancy.occupancyRate}%`} />
        </div>
      </div>

      <div className="admin-card">
        <h3>Revenue</h3>
        <div className="admin-stat-grid">
          <StatCard label="Monthly Rent Roll" value={currency(revenue.monthlyRentRoll)} accent />
          <StatCard label="Collected This Month" value={currency(revenue.collectedThisMonth)} />
          <StatCard label="Pending" value={currency(revenue.pendingAmount)} />
          <StatCard label="Total Collected" value={currency(revenue.totalCollected)} />
        </div>
      </div>

      <div className="admin-two-col-1-1">
        <div className="admin-card">
          <h3>Bookings ({bookings.total})</h3>
          <BreakdownList
            entries={[
              ['Pending', bookings.byStatus.Pending],
              ['Confirmed', bookings.byStatus.Confirmed],
              ['Cancelled', bookings.byStatus.Cancelled],
              ['Tour requests', bookings.byType.tour],
              ['Direct bookings', bookings.byType.direct],
            ]}
          />
        </div>
        <div className="admin-card">
          <h3>Tenants ({tenants.total})</h3>
          <BreakdownList
            entries={[
              ['Active', tenants.active],
              ['Former', tenants.former],
              ['Paid', tenants.byPaymentStatus.Paid],
              ['Due', tenants.byPaymentStatus.Due],
              ['Overdue', tenants.byPaymentStatus.Overdue],
            ]}
          />
        </div>
      </div>
    </div>
  );
}
