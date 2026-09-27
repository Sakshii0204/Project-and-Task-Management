export function ProgressBar({
  progress = 0,
  showLabel = true,
  height = 8,
  className = '',
}) {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  let variant = '';
  if (safeProgress === 100) variant = 'success';
  else if (safeProgress < 30) variant = 'warning';

  return (
    <div className={`progress-component ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {safeProgress}%
          </span>
        </div>
      )}
      <div className="progress-bar-container" style={{ height: `${height}px` }}>
        <div
          className={`progress-bar-fill ${variant}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
}
