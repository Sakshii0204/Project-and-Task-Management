import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
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
          backgroundColor: '#fef2f2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <ShieldAlert size={32} />
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#991b1b' }}>
        Access Restricted
      </h1>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
        Unauthorized Permission
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '12px auto 24px auto', fontSize: '13.5px' }}>
        Your current workspace role does not have authorization to view this section. Use the Demo
        RBAC switcher in the sidebar to simulate an authorized role.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
