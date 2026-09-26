import { useMemo, useState } from 'react';
import { FaFileExport, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { exportCsv } from '../../lib/exportCsv';
import './DataTable.css';

const PAGE_SIZE_OPTIONS = [5, 7, 10, 25];

export default function DataTable({
  title,
  columns,
  rows,
  filters,
  exportFilename,
  emptyMessage = 'No data yet.',
  rowIcon: RowIcon,
  paginated = false,
  defaultPageSize = 7,
}) {
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  const pageCount = paginated ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visibleRows = useMemo(() => {
    if (!paginated) return rows;
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, paginated, currentPage, pageSize]);

  const handleExport = () => {
    exportCsv(
      exportFilename ?? 'export.csv',
      columns.map((col) => ({ label: col.header, value: col.value ?? ((row) => row[col.key]) })),
      rows,
    );
  };

  return (
    <div className="admin-card admin-data-table">
      {(title || filters || exportFilename) && (
        <div className="admin-data-table__head">
          {title && <h3>{title}</h3>}
          <div className="admin-data-table__controls">
            {filters}
            {exportFilename && (
              <button type="button" className="admin-btn admin-btn-outline" onClick={handleExport}>
                <FaFileExport /> Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      <div className="admin-data-table__scroll">
        <table>
          <thead>
            <tr>
              {RowIcon && <th className="admin-data-table__icon-col" />}
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (RowIcon ? 1 : 0)} className="admin-empty-state">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id}>
                  {RowIcon && (
                    <td className="admin-data-table__icon-col">
                      <span className="admin-data-table__row-icon">
                        <RowIcon row={row} />
                      </span>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : (col.value ? col.value(row) : row[col.key])}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginated && rows.length > 0 && (
        <div className="admin-data-table__footer">
          <div className="admin-data-table__page-size">
            <span>Rows per page</span>
            <select
              className="admin-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="admin-data-table__pagination">
            <button
              type="button"
              className="admin-icon-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </button>
            <span className="admin-data-table__page-num">{currentPage}</span>
            <button
              type="button"
              className="admin-icon-btn"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              aria-label="Next page"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
