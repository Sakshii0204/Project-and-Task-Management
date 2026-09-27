import { useState, useMemo } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { UserAvatar } from '../../components/common/UserAvatar';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Select } from '../../components/common/Select';
import { Mail, MapPin, Briefcase, CheckSquare, ShieldCheck } from 'lucide-react';

export function TeamPage() {
  const { users, projects, tasks } = useProjects();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = user.name.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchDept = user.department?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }
      if (roleFilter && user.role !== roleFilter) {
        return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'Project Manager':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
      case 'Team Member':
        return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="page-title">Team & User Directory</h2>
        <p className="page-subtitle">
          RBAC member profiles, assigned portfolios, and engineering capacity.
        </p>
      </div>

      {/* RBAC Info Card */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ShieldCheck size={22} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Role-Based Access Control (RBAC):</strong>{' '}
          In Phase 1, UI permissions and team allocations are pre-configured for{' '}
          <strong>Admin</strong>, <strong>Project Manager</strong>, and <strong>Team Member</strong>.
          Phase 2 will integrate server-side RBAC guards via Express and MongoDB.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        showReset={Boolean(search || roleFilter)}
        onReset={() => {
          setSearch('');
          setRoleFilter('');
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, department..."
        />

        <div style={{ minWidth: '170px' }}>
          <Select
            name="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Project Manager', label: 'Project Manager' },
              { value: 'Team Member', label: 'Team Member' },
            ]}
            placeholder=""
          />
        </div>
      </FilterBar>

      {/* Team Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {filteredUsers.map((user) => {
          // Calculate active assignments dynamically with Phase 2 MongoDB/mock compatibility
          const assignedProjects = projects.filter(
            (p) =>
              p.managerId === user.id ||
              p.managerId === user._id ||
              p.managerName === user.name ||
              p.teamMemberIds?.includes(user.id) ||
              p.teamMemberIds?.includes(user._id)
          );
          const assignedTasks = tasks.filter(
            (t) =>
              t.assigneeId === user.id ||
              t.assigneeId === user._id ||
              t.assigneeName === user.name
          );
          const completedTasks = assignedTasks.filter((t) => t.status === 'Completed').length;
          const badge = getRoleBadge(user.role);

          return (
            <div
              key={user.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <UserAvatar src={user.avatar} name={user.name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {user.title || user.department}
                    </p>
                    <div style={{ marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-block',
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={13} color="var(--text-muted)" />
                    <span>{user.email}</span>
                  </div>
                  {user.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={13} color="var(--text-muted)" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Metric Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={14} color="var(--brand-primary)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                      Projects
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {assignedProjects.length} Assigned
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={14} color="#10b981" />
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>
                      Tasks
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {completedTasks}/{assignedTasks.length} Done
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
