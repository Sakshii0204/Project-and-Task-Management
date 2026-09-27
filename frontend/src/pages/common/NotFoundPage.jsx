import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: 'var(--brand-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Compass size={32} />
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
        404
      </h1>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '12px auto 24px auto', fontSize: '13.5px' }}>
        The route you are navigating to does not exist or may have been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
