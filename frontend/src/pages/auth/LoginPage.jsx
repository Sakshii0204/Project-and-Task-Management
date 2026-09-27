import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, Shield, Briefcase, Code, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { demoCredentials } from '../../data/mockUsers';
import { validateLoginForm } from '../../utils/validators';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: 'dev@thinqloud.com',
    password: 'DevPassword123!',
    rememberMe: true,
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setAuthError('');
  };

  const handleAutofill = (credKey) => {
    const cred = demoCredentials[credKey];
    if (cred) {
      setFormData({
        email: cred.email,
        password: cred.password,
        rememberMe: true,
      });
      setErrors({});
      setAuthError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setAuthError('');
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px',
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          padding: '36px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 12px auto',
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Layers size={26} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
            ThinqTask Platform
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Project & Task Management System &bull; Thinqloud Solutions
          </p>
        </div>

        {/* Phase 2 Backend Auth Notice Box */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '24px',
            display: 'flex',
            gap: '10px',
            fontSize: '12px',
            color: '#1e40af',
            lineHeight: 1.4,
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Phase 2 Live Backend Authentication:</strong> Connected to Node.js/Express REST API
            and MongoDB with bcrypt password verification and secure HttpOnly JWT cookies.
          </div>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div style={{ marginBottom: '24px' }}>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '8px',
              letterSpacing: '0.04em',
            }}
          >
            One-Click Demo Account Autofill:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 8px' }}
              onClick={() => handleAutofill('admin')}
            >
              <Shield size={12} color="#dc2626" /> Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 8px' }}
              onClick={() => handleAutofill('pm')}
            >
              <Briefcase size={12} color="#2563eb" /> Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '6px 8px' }}
              onClick={() => handleAutofill('dev')}
            >
              <Code size={12} color="#059669" /> Engineer
            </button>
          </div>
        </div>

        {authError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {authError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Corporate Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@thinqloud.com"
            icon={Mail}
            required
            error={errors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            icon={Lock}
            required
            error={errors.password}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember session
            </label>
            <span style={{ color: '#94a3b8', cursor: 'not-allowed', fontSize: '12px' }}>
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%' }}
          >
            Sign In to Workspace <ArrowRight size={16} />
          </Button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          Thinqloud Solutions Pvt. Ltd. &bull; Campus Recruitment Drive 2026
        </div>
      </div>
    </div>
  );
}
