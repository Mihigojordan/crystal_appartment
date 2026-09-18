import './PageHeader.css';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header__text">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </div>
  );
}
