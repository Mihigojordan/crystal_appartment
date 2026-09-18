import { useEffect, useMemo, useState } from 'react';
import {
  FaUserClock,
  FaUsers,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
  FaSyncAlt,
  FaChevronUp,
  FaChevronDown,
  FaSearch,
  FaFileAlt,
  FaShareAlt,
  FaMobileAlt,
  FaDesktop,
  FaTabletAlt,
  FaEye,
  FaTimes,
} from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import { exportPdf } from '../../lib/exportPdf';
import { exportXls } from '../../lib/exportXls';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import '../../components/admin/PageHeader.css';
import './Visitors.css';

function DeviceIcon({ row }) {
  const label = (row.label || '').toLowerCase();
  if (label.includes('mobile')) return <FaMobileAlt />;
  if (label.includes('tablet')) return <FaTabletAlt />;
  return <FaDesktop />;
}

function PageIcon() {
  return <FaFileAlt />;
}

function SourceIcon() {
  return <FaShareAlt />;
}

const LABEL_TRUNCATE_LENGTH = 40;

function LabelCell({ label, onView }) {
  const text = label || '—';
  const isLong = text.length > LABEL_TRUNCATE_LENGTH;
  return (
    <span className="admin-visitors__label-cell">
      {isLong ? `${text.slice(0, LABEL_TRUNCATE_LENGTH)}…` : text}
      {isLong && (
        <button type="button" className="admin-visitors__label-view" onClick={() => onView(text)} aria-label="View full label">
          <FaEye />
        </button>
      )}
    </span>
  );
}

const breakdownColumns = (labelHeader, valueHeader, onView) => [
  { key: 'label', header: labelHeader, render: (r) => <LabelCell label={r.label} onView={onView} /> },
  { key: 'value', header: valueHeader },
];

function filterSortRows(rows, search, sort) {
  let list = rows;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((r) => r.label.toLowerCase().includes(q));
  }
  return [...list].sort((a, b) => (sort === 'desc' ? b.value - a.value : a.value - b.value));
}

export default function Visitors() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [statsOpen, setStatsOpen] = useState(true);
  const [viewing, setViewing] = useState(null);

  const load = () => apiFetch('/visitors').then(setData).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const topPages = useMemo(() => filterSortRows(data?.topPages ?? [], search, sort), [data, search, sort]);
  const sources = useMemo(() => filterSortRows(data?.sources ?? [], search, sort), [data, search, sort]);
  const devices = useMemo(() => filterSortRows(data?.devices ?? [], search, sort), [data, search, sort]);

  const handleExportAllPdf = () => {
    exportPdf('website-visitors.pdf', 'Website Visitors', breakdownColumns('Page', 'Views').map((c) => ({
      label: c.header,
      value: c.key === 'label' ? (r) => r.label : (r) => r.value,
    })), topPages);
  };

  const handleExportAllXls = () => {
    const rows = [
      ...topPages.map((r) => ({ section: 'Top Pages', ...r })),
      ...sources.map((r) => ({ section: 'Traffic Sources', ...r })),
      ...devices.map((r) => ({ section: 'Devices', ...r })),
    ];
    exportXls('website-visitors.xls', [
      { label: 'Section', value: (r) => r.section },
      { label: 'Label', value: (r) => r.label },
      { label: 'Value', value: (r) => r.value },
    ], rows);
  };

  return (
    <div className="admin-visitors">
      <PageHeader
        title="Website Visitors"
        subtitle="Live traffic and engagement analytics — last 28 days"
        actions={
          <>
            <button type="button" className="admin-icon-btn admin-icon-btn--pdf" onClick={handleExportAllPdf} aria-label="Export PDF">
              <FaFilePdf />
            </button>
            <button type="button" className="admin-icon-btn admin-icon-btn--xls" onClick={handleExportAllXls} aria-label="Export Excel">
              <FaFileExcel />
            </button>
            <button type="button" className="admin-icon-btn" onClick={load} aria-label="Refresh">
              <FaSyncAlt />
            </button>
            <button type="button" className="admin-icon-btn" onClick={() => setStatsOpen((v) => !v)} aria-label="Toggle stats">
              {statsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </>
        }
      />

      {error && <p className="admin-empty-state">{error}</p>}

      {statsOpen && (
        <div className="admin-stat-grid">
          <StatCard label="Active Right Now" value={data?.stats.activeUsersNow ?? '—'} accent icon={FaUserClock} />
          <StatCard label="Total Users" value={data?.stats.totalVisitors ?? '—'} icon={FaUsers} iconColor="linear-gradient(135deg,#4f8cff,#3a6fe0)" />
          <StatCard label="Sessions" value={data?.stats.sessions ?? '—'} icon={FaChartLine} iconColor="linear-gradient(135deg,#7fd88f,#4fb868)" />
        </div>
      )}

      <div className="admin-card admin-visitors__toolbar">
        <div className="admin-visitors__search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search pages, sources, devices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="admin-visitors__period">Last 28 days</span>
        <select className="admin-select admin-visitors__sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="desc">Highest first</option>
          <option value="asc">Lowest first</option>
        </select>
      </div>

      <DataTable
        title="Top Pages"
        columns={breakdownColumns('Page', 'Views', setViewing)}
        rows={topPages}
        emptyMessage={data ? 'No page data yet.' : 'Loading…'}
        rowIcon={PageIcon}
        paginated
      />

      <DataTable
        title="Traffic Sources"
        columns={breakdownColumns('Source', 'Sessions', setViewing)}
        rows={sources}
        emptyMessage={data ? 'No source data yet.' : 'Loading…'}
        rowIcon={SourceIcon}
        paginated
      />

      <DataTable
        title="Devices"
        columns={breakdownColumns('Device', 'Users', setViewing)}
        rows={devices}
        emptyMessage={data ? 'No device data yet.' : 'Loading…'}
        rowIcon={DeviceIcon}
        paginated
      />

      {viewing && (
        <div className="admin-visitors__overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal admin-visitors__view" onClick={(e) => e.stopPropagation()}>
            <div className="admin-visitors__view-head">
              <h3>Full Value</h3>
              <button type="button" className="admin-visitors__close" aria-label="Close" onClick={() => setViewing(null)}>
                <FaTimes />
              </button>
            </div>
            <p className="admin-visitors__view-body">{viewing}</p>
          </div>
        </div>
      )}
    </div>
  );
}
