import './StatCard.css';

export default function StatCard({ label, value, accent = false, icon: Icon, iconColor }) {
  return (
    <div className={`admin-card admin-stat-card ${accent ? 'is-accent' : ''} ${Icon ? 'has-icon' : ''}`}>
      {Icon && (
        <span className="admin-stat-card__icon" style={iconColor ? { background: iconColor } : undefined}>
          <Icon />
        </span>
      )}
      <span className="admin-stat-card__label">{label}</span>
      <span className="admin-stat-card__value">{value}</span>
    </div>
  );
}
