import { useEffect, useMemo, useState } from 'react';
import {
  FaBolt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaEye,
  FaList,
  FaSearch,
  FaSignInAlt,
  FaSyncAlt,
  FaThLarge,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from 'react-icons/fa';
import { apiFetch } from '../../lib/apiClient';
import './Logs.css';

const SAMPLE_SIZE_OPTIONS = [7, 10, 25, 50];

const TYPE_META = {
  login: { label: 'Login', badge: 'admin-badge-success', icon: <FaSignInAlt /> },
  warning: { label: 'Warning', badge: 'admin-badge-warning', icon: <FaExclamationTriangle /> },
  error: { label: 'Error', badge: 'admin-badge-danger', icon: <FaTimesCircle /> },
};

const metaFor = (type) => TYPE_META[type] ?? { label: type || 'Info', badge: 'admin-badge-muted', icon: <FaBolt /> };

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const todayStr = () => new Date().toISOString().slice(0, 10);

const ACTIVITY_TRUNCATE_LENGTH = 60;

export default function Logs() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [statsCollapsed, setStatsCollapsed] = useState(false);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState('list');

  const [sampleSize, setSampleSize] = useState(7);
  const [visibleCount, setVisibleCount] = useState(7);
  const [selected, setSelected] = useState(() => new Set());
  const [viewing, setViewing] = useState(null);

  const load = () => {
    apiFetch('/logs').then(setData).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const entries = useMemo(() => data?.entries ?? [], [data]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== 'All' && e.type !== statusFilter) return false;
      if (dateFrom && (!e.time || e.time.slice(0, 10) < dateFrom)) return false;
      if (dateTo && (!e.time || e.time.slice(0, 10) > dateTo)) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.activity} ${e.source} ${e.type}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, statusFilter, dateFrom, dateTo, search]);

  const visibleRows = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const visibleAllSelected = visibleRows.length > 0 && visibleRows.every((r) => selected.has(r.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (visibleAllSelected) {
        visibleRows.forEach((r) => next.delete(r.id));
      } else {
        visibleRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (row) => {
    if (!confirm('Delete this log entry?')) return;
    await apiFetch(`/logs/${row.id}`, { method: 'DELETE' });
    if (viewing?.id === row.id) setViewing(null);
    setSelected((prev) => {
      if (!prev.has(row.id)) return prev;
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
    load();
  };

  const exportRows = selected.size > 0 ? filtered.filter((r) => selected.has(r.id)) : filtered;

  const handleExportPdf = () => {
    const rowsHtml = exportRows
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.activity)}</td><td>${escapeHtml(r.source || '—')}</td><td>${escapeHtml(metaFor(r.type).label)}</td><td>${escapeHtml(formatDateTime(r.time))}</td></tr>`,
      )
      .join('');
    const html = `<!doctype html><html><head><title>Activity Logs</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
      h1{font-size:18px;margin-bottom:4px}
      p{color:#666;margin-top:0;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}
      th{background:#f5f5f5}
    </style></head><body>
      <h1>Activity Logs</h1>
      <p>Exported ${escapeHtml(new Date().toLocaleString())} — ${exportRows.length} entr${exportRows.length === 1 ? 'y' : 'ies'}</p>
      <table><thead><tr><th>Activity</th><th>Source</th><th>Type</th><th>Time</th></tr></thead><tbody>${rowsHtml}</tbody></table>
    </body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleExportXls = () => {
    const rowsHtml = exportRows
      .map(
        (r) =>
          `<tr><td>${escapeHtml(r.activity)}</td><td>${escapeHtml(r.source || '')}</td><td>${escapeHtml(metaFor(r.type).label)}</td><td>${escapeHtml(formatDateTime(r.time))}</td></tr>`,
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr><th>Activity</th><th>Source</th><th>Type</th><th>Time</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity-logs.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const viewAllToday = () => {
    setStatusFilter('All');
    setDateFrom(todayStr());
    setDateTo(todayStr());
    setVisibleCount(sampleSize);
  };

  const viewAllOfType = (type) => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter(type);
    setVisibleCount(sampleSize);
  };

  const stats = data?.stats;

  return (
    <div className="admin-logs">
      <div className="admin-logs__head">
        <div>
          <h2>Activity Logs</h2>
        </div>
        <div className="admin-logs__head-actions">
          <button type="button" className="admin-logs__label-btn admin-logs__label-btn--pdf" onClick={handleExportPdf} aria-label="Export PDF">
            PDF
          </button>
          <button type="button" className="admin-logs__label-btn admin-logs__label-btn--xls" onClick={handleExportXls} aria-label="Export Excel">
            XLS
          </button>
          <button type="button" className="admin-icon-btn" onClick={load} aria-label="Refresh">
            <FaSyncAlt />
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => setStatsCollapsed((v) => !v)}
            aria-label="Toggle summary"
          >
            {statsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      {error && <p className="admin-empty-state">{error}</p>}

      {!statsCollapsed && (
        <div className="admin-stat-grid">
          <div className="admin-card admin-logs__stat">
            <div className="admin-logs__stat-top">
              <span className="admin-logs__stat-icon admin-logs__stat-icon--info"><FaBolt /></span>
              <span className="admin-stat-card__label">EVENTS TODAY</span>
            </div>
            <span className="admin-stat-card__value">{stats?.eventsToday ?? '—'}</span>
            <button type="button" className="admin-logs__view-all" onClick={viewAllToday}>View All</button>
          </div>
          <div className="admin-card admin-logs__stat">
            <div className="admin-logs__stat-top">
              <span className="admin-logs__stat-icon admin-logs__stat-icon--success"><FaSignInAlt /></span>
              <span className="admin-stat-card__label">LOGINS</span>
            </div>
            <span className="admin-stat-card__value">{stats?.logins ?? '—'}</span>
            <button type="button" className="admin-logs__view-all" onClick={() => viewAllOfType('login')}>View All</button>
          </div>
          <div className="admin-card admin-logs__stat">
            <div className="admin-logs__stat-top">
              <span className="admin-logs__stat-icon admin-logs__stat-icon--warning"><FaExclamationTriangle /></span>
              <span className="admin-stat-card__label">WARNINGS</span>
            </div>
            <span className="admin-stat-card__value">{stats?.warnings ?? '—'}</span>
            <button type="button" className="admin-logs__view-all" onClick={() => viewAllOfType('warning')}>View All</button>
          </div>
          <div className="admin-card admin-logs__stat">
            <div className="admin-logs__stat-top">
              <span className="admin-logs__stat-icon admin-logs__stat-icon--danger"><FaTimesCircle /></span>
              <span className="admin-stat-card__label">ERRORS</span>
            </div>
            <span className="admin-stat-card__value">{stats?.errors ?? '—'}</span>
            <button type="button" className="admin-logs__view-all admin-logs__view-all--danger" onClick={() => viewAllOfType('error')}>View All</button>
          </div>
        </div>
      )}

      <div className="admin-card admin-logs__toolbar">
        <div className="admin-logs__search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by activity, source, type…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(sampleSize); }}
          />
        </div>
        <div className="admin-logs__date-range">
          <span className="admin-text-muted">Time</span>
          <input
            type="date"
            className="admin-input"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setVisibleCount(sampleSize); }}
          />
          <span className="admin-text-muted">→</span>
          <input
            type="date"
            className="admin-input"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setVisibleCount(sampleSize); }}
          />
        </div>
        <div className="admin-logs__toolbar-right">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setVisibleCount(sampleSize); }}
          >
            <option value="All">Status</option>
            <option value="login">Login</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <div className="admin-logs__view-toggle">
            <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="List view">
              <FaList />
            </button>
            <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view">
              <FaThLarge />
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card admin-logs__table-card">
        {!data ? (
          <p className="admin-empty-state">Loading…</p>
        ) : visibleRows.length === 0 ? (
          <p className="admin-empty-state">No activity recorded yet.</p>
        ) : view === 'list' ? (
          <div className="admin-data-table__scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" checked={visibleAllSelected} onChange={toggleSelectAll} />
                  </th>
                  <th>Activity</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const meta = metaFor(row.type);
                  const activity = row.activity || '—';
                  const isLong = activity.length > ACTIVITY_TRUNCATE_LENGTH;
                  return (
                    <tr key={row.id}>
                      <td>
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                      </td>
                      <td>
                        <div className="admin-logs__activity-cell">
                          <span className={`admin-logs__type-icon admin-logs__type-icon--${meta.badge.replace('admin-badge-', '')}`}>
                            {meta.icon}
                          </span>
                          <span className="admin-logs__activity-text">
                            {isLong ? `${activity.slice(0, ACTIVITY_TRUNCATE_LENGTH)}…` : activity}
                          </span>
                        </div>
                      </td>
                      <td>{row.source || '—'}</td>
                      <td>
                        <span className={`admin-badge ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td>{formatDateTime(row.time)}</td>
                      <td>
                        <div className="admin-logs__row-actions">
                          <button type="button" onClick={() => setViewing(row)} aria-label="View more">
                            <FaEye />
                          </button>
                          <button type="button" onClick={() => handleDelete(row)} aria-label="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-logs__grid">
            {visibleRows.map((row) => {
              const meta = metaFor(row.type);
              const activity = row.activity || '—';
              const isLong = activity.length > ACTIVITY_TRUNCATE_LENGTH;
              return (
                <div key={row.id} className="admin-logs__grid-card">
                  <div className="admin-logs__grid-card-head">
                    <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                    <span className={`admin-badge ${meta.badge}`}>{meta.label}</span>
                  </div>
                  <span>{isLong ? `${activity.slice(0, ACTIVITY_TRUNCATE_LENGTH)}…` : activity}</span>
                  <span className="admin-text-muted">{row.source || 'Unknown source'}</span>
                  <span className="admin-text-muted">{formatDateTime(row.time)}</span>
                  <div className="admin-logs__row-actions">
                    <button type="button" onClick={() => setViewing(row)} aria-label="View more">
                      <FaEye />
                    </button>
                    <button type="button" onClick={() => handleDelete(row)} aria-label="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="admin-card admin-logs__footer">
        <div className="admin-logs__rows-per-page">
          <label className="admin-text-muted">Sample Size</label>
          <select
            className="admin-select"
            value={sampleSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setSampleSize(size);
              setVisibleCount(size);
            }}
          >
            {SAMPLE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="admin-text-muted">
            Showing {visibleRows.length} of {filtered.length} entries
          </span>
        </div>
        {hasMore && (
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setVisibleCount((v) => Math.min(filtered.length, v + sampleSize))}
          >
            View More
          </button>
        )}
      </div>

      {viewing && (
        <div className="admin-logs__overlay" onClick={() => setViewing(null)}>
          <div className="admin-modal admin-logs__view" onClick={(e) => e.stopPropagation()}>
            <div className="admin-logs__view-head">
              <h3>Activity Detail</h3>
              <button type="button" className="admin-logs__close" aria-label="Close" onClick={() => setViewing(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="admin-logs__view-meta">
              <span className={`admin-badge ${metaFor(viewing.type).badge}`}>{metaFor(viewing.type).label}</span>
              <span>{formatDateTime(viewing.time)}</span>
            </div>

            <dl className="admin-logs__view-fields">
              <dt>Source</dt>
              <dd>{viewing.source || '—'}</dd>
            </dl>

            <p className="admin-logs__view-body">{viewing.activity || '—'}</p>

            <div className="admin-logs__view-actions">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => handleDelete(viewing)}
              >
                <FaTrash /> Delete
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
