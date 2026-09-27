import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by keyword...',
  className = '',
}) {
  return (
    <div
      className={`search-bar-box ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minWidth: '240px',
      }}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: '36px', paddingRight: value ? '32px' : '12px' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
