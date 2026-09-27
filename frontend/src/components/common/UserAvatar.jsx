import { getInitials } from '../../utils/formatters';

export function UserAvatar({
  src,
  name = 'User',
  size = 32,
  className = '',
  title,
}) {
  const initials = getInitials(name);

  return (
    <div
      className={`user-avatar ${className}`}
      title={title || name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#e2e8f0',
        color: '#334155',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: `${Math.round(size * 0.4)}px`,
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // fallback to initials on broken image
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}
