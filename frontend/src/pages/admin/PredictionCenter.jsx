import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/apiClient';
import StatCard from '../../components/admin/StatCard';
import './Overview.css';

const currency = (n) => `$${Math.round(n).toLocaleString()}`;

export default function PredictionCenter() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiFetch('/dashboard/reports'), apiFetch('/dashboard/overview')])
      .then(([reports, overview]) => setData({ reports, overview }))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="admin-empty-state">{error}</p>;
  if (!data) return <p className="admin-empty-state">Loading…</p>;

  const { reports, overview } = data;

  const weeklyTotal = overview.weeklyBookings.reduce((sum, d) => sum + d.count, 0);
  const projectedBookings30d = Math.round((weeklyTotal / 7) * 30);

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedFullMonthCollections =
    dayOfMonth > 0 ? (reports.revenue.collectedThisMonth / dayOfMonth) * daysInMonth : 0;

  return (
    <div className="admin-overview">
      <div className="admin-branded-header">
        <h2>Prediction Center</h2>
        <p>Simple projections extrapolated from current data — not a machine-learning forecast.</p>
      </div>

      <div className="admin-stat-grid">
        <StatCard label="Recurring Monthly Revenue" value={currency(reports.revenue.monthlyRentRoll)} accent />
        <StatCard label="Current Occupancy Rate" value={`${reports.occupancy.occupancyRate}%`} />
        <StatCard label="Projected Bookings (30d)" value={projectedBookings30d} />
        <StatCard label="Projected Collections (Full Month)" value={currency(projectedFullMonthCollections)} />
      </div>

      <div className="admin-two-col-1-1">
        <div className="admin-card">
          <h3>How These Are Calculated</h3>
          <ul className="admin-overview__list">
            <li>
              <span>Recurring Monthly Revenue</span>
              <strong>Sum of rent across occupied units</strong>
            </li>
            <li>
              <span>Projected Bookings (30d)</span>
              <strong>Avg. bookings/day this week × 30</strong>
            </li>
            <li>
              <span>Projected Collections</span>
              <strong>This month's pace × days remaining</strong>
            </li>
          </ul>
        </div>
        <div className="admin-card">
          <h3>Where This Could Go Next</h3>
          <p className="admin-text-muted" style={{ lineHeight: 1.7 }}>
            These projections use straight-line extrapolation from live data — they'll get more
            accurate as more bookings and payments accumulate. A real forecasting model (seasonal
            trends, lease-renewal likelihood, churn risk) would need historical time-series data
            this system hasn't collected yet.
          </p>
        </div>
      </div>
    </div>
  );
}
