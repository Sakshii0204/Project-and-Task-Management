import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-md)',
        color: '#991b1b',
        margin: '16px 0',
      }}
    >
      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{title}</h4>
        <p style={{ fontSize: '13px', color: '#b91c1c' }}>{message}</p>
        {onRetry && (
          <div style={{ marginTop: '10px' }}>
            <Button size="sm" variant="danger" icon={RefreshCw} onClick={onRetry}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
