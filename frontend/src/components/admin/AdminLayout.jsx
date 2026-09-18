import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/admin-theme.css';
import './AdminLayout.css';

export default function AdminLayout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') ?? 'dark');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  return (
    <div
      className="admin-root admin-layout"
      data-theme={theme}
      style={{ '--sidebar-w': `${sidebarExpanded ? 300 : 88}px` }}
    >
      <Topbar
        theme={theme}
        sidebarExpanded={sidebarExpanded}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onToggleSidebar={() => setSidebarExpanded((v) => !v)}
        search={search}
        onSearchChange={setSearch}
      />
      <div className="admin-layout__body">
        <Sidebar expanded={sidebarExpanded} />
        <div className="admin-layout__content">
          <Outlet context={{ search }} />
        </div>
      </div>
    </div>
  );
}
