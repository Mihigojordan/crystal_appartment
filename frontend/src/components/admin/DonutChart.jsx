const COLORS = ['var(--admin-success)', 'var(--admin-warning)', 'var(--admin-text-muted)'];

export default function DonutChart({ segments }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce((acc, seg, i) => {
    const dash = (seg.value / total) * circumference;
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ ...seg, dash, offset, color: seg.color ?? COLORS[i % COLORS.length] });
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--admin-surface-4)" strokeWidth="18" />
        {arcs.map((seg) => (
          <circle
            key={seg.label}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((seg, i) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: seg.color ?? COLORS[i % COLORS.length],
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--admin-text-muted)' }}>{seg.label}</span>
            <strong>{seg.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
