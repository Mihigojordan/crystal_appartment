import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import DonutChart from '../../components/admin/DonutChart';
import WeeklyBarChart from '../../components/admin/WeeklyBarChart';
import './Overview.css';

const currency = (n) => `$${n.toLocaleString()}`;

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/dashboard/overview').then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="admin-empty-state">{error}</p>;
  if (!data) return <p className="admin-empty-state">Loading…</p>;

  const { stats, occupancy, weeklyBookings, recentBookings, recentActivity } = data;

  return (
    <div className="admin-overview">
      <h2>Overview</h2>

      <div className="admin-stat-grid">
        <StatCard label="Total Apartments" value={stats.totalApartments} />
        <StatCard label="Occupied Units" value={stats.occupiedUnits} accent />
        <StatCard label="Monthly Revenue" value={currency(stats.monthlyRevenue)} accent />
        <StatCard
          label="Website Visitors"
          value={stats.websiteVisitors > 0 ? stats.websiteVisitors : 'No data yet'}
        />
      </div>

      <div className="admin-two-col-1-4">
        <div className="admin-card">
          <h3>Bookings This Week</h3>
          <WeeklyBarChart data={weeklyBookings} />
        </div>
        <div className="admin-card">
          <h3>Occupancy</h3>
          <DonutChart
            segments={[
              { label: 'Occupied', value: occupancy.occupied, color: 'var(--admin-success)' },
              { label: 'Vacant', value: occupancy.vacant, color: 'var(--admin-warning)' },
              { label: 'Maintenance', value: occupancy.maintenance, color: 'var(--admin-text-muted)' },
            ]}
          />
        </div>
      </div>

      <div className="admin-two-col-1-1">
        <div className="admin-card">
          <h3>Recent Bookings</h3>
          {recentBookings.length === 0 ? (
            <p className="admin-empty-state">No bookings yet.</p>
          ) : (
            <ul className="admin-overview__list">
              {recentBookings.map((b) => (
                <li key={b.id}>
                  <span>{b.guestName}</span>
                  <span className="admin-text-muted">{b.apartmentTitle}</span>
                  <span className={`admin-badge admin-badge-${b.status === 'Confirmed' ? 'success' : b.status === 'Cancelled' ? 'muted' : 'warning'}`}>
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="admin-card">
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="admin-empty-state">No activity recorded yet — logging isn't wired up yet.</p>
          ) : (
            <ul className="admin-overview__list">
              {recentActivity.map((a, i) => (
                <li key={i}>{a.activity}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
