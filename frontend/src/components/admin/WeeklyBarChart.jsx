export default function WeeklyBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
          <div
            style={{
              width: '100%',
              maxWidth: 28,
              height: `${(d.count / max) * 110 || 2}px`,
              borderRadius: 6,
              background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent-2))',
            }}
            title={`${d.label}: ${d.count}`}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
