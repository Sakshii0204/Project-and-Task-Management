import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CheckCircle2, Shield, Lock } from 'lucide-react';

export function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();

  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    title: currentUser?.title || '',
    department: currentUser?.department || '',
    phone: currentUser?.phone || '',
    location: currentUser?.location || '',
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title">User Profile & Account</h2>
        <p className="page-subtitle">
          Manage your personal details, workspace role, and preferences.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>Profile information updated successfully! Changes saved to mock storage.</span>
        </div>
      )}

      {/* Profile Overview Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <UserAvatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            size={72}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser?.name}
              </h3>
              <span
                className="badge badge-status-progress"
                style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Shield size={11} /> {currentUser?.role}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentUser?.title || 'Team Member'} &bull; {currentUser?.department}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '2px' }}>
              {currentUser?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Information Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title" style={{ marginBottom: '16px' }}>
          Personal Information
        </h3>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Corporate Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Office Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Authentication Notice Card */}
      <div className="card" style={{ borderColor: '#bfdbfe', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Lock size={20} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Password & Security (Phase 2 Preview)
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              In Phase 1, password updates are restricted to ensure mock state stability. In Phase 2,
              this section will connect to a Node.js/Express endpoint with bcrypt password salting,
              JWT session revocation, and multi-factor authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
