export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  hint,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            <Icon size={16} />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${error ? 'error' : ''}`}
          style={Icon ? { paddingLeft: '36px' } : {}}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}
