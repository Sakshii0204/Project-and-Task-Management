export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend,
}) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#ecfdf5', color: '#10b981' };
      case 'warning':
        return { bg: '#fffbeb', color: '#f59e0b' };
      case 'danger':
        return { bg: '#fef2f2', color: '#ef4444' };
      case 'info':
        return { bg: '#eff6ff', color: '#3b82f6' };
      default:
        return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const colors = getColors();

  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: colors.bg, color: colors.color }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {subtitle && <span className="stat-sub">{subtitle}</span>}
          {trend && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: trend.isPositive ? '#10b981' : '#ef4444',
              }}
            >
              {trend.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
