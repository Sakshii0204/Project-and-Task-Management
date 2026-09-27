import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { UserAvatar } from '../common/UserAvatar';
import { formatDate } from '../../utils/formatters';

export function Header({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { activities, resetAllData } = useProjects();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title generation based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/projects') return 'Project Portfolio';
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path === '/tasks') return 'Enterprise Task Directory';
    if (path.startsWith('/tasks/')) return 'Task Details';
    if (path === '/my-tasks') return 'My Assigned Tasks';
    if (path === '/overdue') return 'Overdue Activities & Deadlines';
    if (path === '/team') return 'Team & User Directory';
    if (path === '/profile') return 'My Profile & Preferences';
    return 'Project & Task Management';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="btn-ghost"
          onClick={onMenuClick}
          style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="page-title" style={{ fontSize: '18px' }}>
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="header-right">
        {/* Reset Mock Data Quick Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={resetAllData}
          title="Reset local changes back to clean seed mock data"
          style={{ fontSize: '12px' }}
        >
          <RotateCcw size={13} />
          <span className="hide-on-mobile">Reset Demo Data</span>
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="btn-ghost"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="View notifications"
          >
            <Bell size={19} />
            {activities.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {notifOpen && (
            <div className="dropdown-panel" style={{ width: '320px', right: 0 }}>
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Recent Audit Activity</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {activities.length} updates
                </span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <CheckCircle size={12} color="#2563eb" />
                      <strong style={{ color: 'var(--text-primary)' }}>{act.userName}</strong>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {act.action}: <em>{act.target}</em>
                    </p>
                    <span style={{ color: 'var(--text-subtle)', fontSize: '11px' }}>
                      {formatDate(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div
            className="user-profile-menu"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <UserAvatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              size={36}
            />
            <div className="user-meta-header hide-on-mobile">
              <span className="user-name-header">{currentUser?.name || 'Guest User'}</span>
              <span className="user-role-header">{currentUser?.role || 'Viewer'}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {userMenuOpen && (
            <div className="dropdown-panel">
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser?.email}</p>
                <span
                  className="badge badge-status-progress"
                  style={{ marginTop: '6px', fontSize: '11px' }}
                >
                  {currentUser?.role}
                </span>
              </div>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <UserIcon size={15} />
                <span>My Profile</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
