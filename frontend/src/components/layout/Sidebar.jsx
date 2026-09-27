import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  UserCheck,
  AlertTriangle,
  Users,
  User,
  Layers,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

export function Sidebar({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { projects, getUserTasks, getOverdueTasks } = useProjects();

  const myTasksCount = currentUser ? getUserTasks(currentUser.id).length : 0;
  const overdueCount = getOverdueTasks().length;
  const projectsCount = projects.length;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban, count: projectsCount },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'My Tasks', path: '/my-tasks', icon: UserCheck, count: myTasksCount },
    {
      label: 'Overdue',
      path: '/overdue',
      icon: AlertTriangle,
      count: overdueCount,
      isAlert: overdueCount > 0,
    },
    { label: 'Team / Users', path: '/team', icon: Users },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="brand-badge" onClick={onClose}>
            <div className="brand-logo-box">
              <Layers size={20} />
            </div>
            <div className="brand-info">
              <span className="brand-name">ThinqTask</span>
              <span className="brand-sub">Thinqloud Solutions</span>
            </div>
          </NavLink>
          {isOpen && (
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{ color: '#94a3b8', border: 'none', cursor: 'pointer' }}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-title">Core Navigation</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`nav-counter ${item.isAlert ? 'alert' : ''}`}>
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Authenticated Server-Side RBAC Badge */}
        <div className="sidebar-footer">
          <div className="demo-role-badge-box">
            <span style={{ color: '#94a3b8' }}>Session RBAC:</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentUser?.role || 'Guest'}</span>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.3,
            }}
          >
            Enforced by MongoDB. To switch roles, log out and sign in with demo accounts.
          </div>
        </div>
      </aside>
    </>
  );
}
