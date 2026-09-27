import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading data...', size = 32 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: '12px',
        color: 'var(--text-muted)',
      }}
    >
      <Loader2
        size={size}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--brand-primary)',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ fontSize: '13px', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
