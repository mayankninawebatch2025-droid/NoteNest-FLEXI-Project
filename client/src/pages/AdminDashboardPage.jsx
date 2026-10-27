import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileCheck,
  Flag,
  Download,
  Check,
  X,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  UserCheck,
  UserX,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ConfirmationModal } from '../components/ConfirmationModal';
import api from '../api/client';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'moderation' | 'reports' | 'users'
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Moderation tab state
  const [moderationList, setModerationList] = useState([]);
  const [modFilter, setModFilter] = useState('pending');
  const [isLoadingMod, setIsLoadingMod] = useState(false);

  // Reports tab state
  const [reportsList, setReportsList] = useState([]);
  const [reportFilter, setReportFilter] = useState('pending');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Users tab state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Action Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    confirmVariant: 'primary',
  });

  // Fetch KPI Stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.success) {
        setStats(res.stats);
        setCharts(res.charts);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load admin metrics', 'error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch Moderation Queue
  const fetchModerationQueue = async () => {
    setIsLoadingMod(true);
    try {
      const res = await api.get('/admin/moderation', { status: modFilter !== 'All' ? modFilter : undefined });
      if (res.success) {
        setModerationList(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load moderation queue', 'error');
    } finally {
      setIsLoadingMod(false);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await api.get('/admin/reports', { status: reportFilter !== 'All' ? reportFilter : undefined });
      if (res.success) {
        setReportsList(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load reports', 'error');
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await api.get('/admin/users', {
        search: userSearch.trim() || undefined,
        role: userRoleFilter !== 'All' ? userRoleFilter : undefined,
      });
      if (res.success) {
        setUsersList(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load user list', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'moderation') fetchModerationQueue();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, modFilter, reportFilter, userRoleFilter]);

  // Handle Moderation Action (Approve / Reject)
  const handleModerate = async (resourceId, status) => {
    try {
      const res = await api.put(`/admin/moderation/${resourceId}`, { status });
      if (res.success) {
        showToast(`Resource marked as ${status}`, 'success');
        fetchModerationQueue();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Moderation action failed', 'error');
    }
  };

  // Handle Report Resolution
  const handleResolveReport = async (reportId, status, deleteResource = false) => {
    try {
      const res = await api.put(`/admin/reports/${reportId}`, {
        status,
        deleteResource,
        resolutionNote: `Moderated by admin on ${new Date().toLocaleDateString()}`,
      });
      if (res.success) {
        showToast(res.message, 'success');
        fetchReports();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to resolve report', 'error');
    }
  };

  // Toggle User Role
  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'student' : 'admin';
    try {
      const res = await api.put(`/admin/users/${targetUser._id}`, { role: nextRole });
      if (res.success) {
        showToast(`Role updated to ${nextRole} for ${targetUser.name}`, 'success');
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user role', 'error');
    }
  };

  // Toggle User Active Status (Ban / Unban)
  const handleToggleUserActive = async (targetUser) => {
    const nextStatus = !targetUser.isActive;
    try {
      const res = await api.put(`/admin/users/${targetUser._id}`, { isActive: nextStatus });
      if (res.success) {
        showToast(`User ${nextStatus ? 'activated' : 'deactivated'}`, 'info');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to change user status', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div className="badge badge-lavender" style={{ marginBottom: '8px' }}>
            <ShieldAlert size={14} />
            Administrative Control Panel
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            NoteNest Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Oversee user accounts, review reports, and enforce academic quality standards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/explore" className="btn btn-secondary btn-sm">
            View Public Site
          </Link>
          <Link to="/upload" className="btn btn-primary btn-sm">
            Publish Notice / Note
          </Link>
        </div>
      </div>

      {/* Admin Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '32px',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'overview' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'overview' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'overview' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Layers size={16} />
          Overview & Metrics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'moderation' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'moderation' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'moderation' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
          }}
        >
          <FileCheck size={16} />
          Resource Moderation {stats?.resources?.pending > 0 && <span className="badge badge-warning">{stats.resources.pending}</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'reports' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'reports' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'reports' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Flag size={16} />
          Reports Review {stats?.pendingReports > 0 && <span className="badge badge-danger">{stats.pendingReports}</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'users' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'users' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'users' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={16} />
          User Management ({stats?.users?.total || 0})
        </button>
      </div>

      {/* Tab: Overview & Metrics */}
      {activeTab === 'overview' && (
        <div>
          {isLoadingStats ? (
            <SkeletonLoader count={4} type="card" />
          ) : stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                }}
              >
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Total Registered Users
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                    {stats.users.total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats.users.students} Students • {stats.users.admins} Faculty Admins
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Total Materials Uploaded
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-lavender)' }}>
                    {stats.resources.total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stats.resources.approved} Approved • {stats.resources.pending} Pending
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Total Platform Downloads
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-solid)' }}>
                    {stats.downloads}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Backend validated increments
                  </div>
                </div>

                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>
                    Actionable Reports
                  </div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: stats.pendingReports > 0 ? 'var(--danger-solid)' : 'var(--text-muted)',
                    }}
                  >
                    {stats.pendingReports}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Awaiting moderation review
                  </div>
                </div>
              </div>

              {/* Breakdown Distributions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Branch Breakdown */}
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Resources by Department / Branch
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {charts?.byBranch?.map((b) => (
                      <div key={b._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{b._id || 'Unspecified'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{b.count} uploads</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, (b.count / (stats.resources.total || 1)) * 100)}%`,
                              backgroundColor: 'var(--primary-600)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Breakdown */}
                <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Resources by Academic Format
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {charts?.byType?.map((t) => (
                      <div key={t._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{t._id}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{t.count} files</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, (t.count / (stats.resources.total || 1)) * 100)}%`,
                              backgroundColor: 'var(--accent-lavender)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab: Resource Moderation */}
      {activeTab === 'moderation' && (
        <div>
          {/* Moderation filter bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['pending', 'approved', 'rejected', 'All'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setModFilter(s)}
                className={`btn btn-sm ${modFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoadingMod ? (
            <SkeletonLoader count={4} type="table" />
          ) : moderationList.length > 0 ? (
            <div className="card" style={{ padding: '8px 0', backgroundColor: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 20px' }}>Title</th>
                    <th style={{ padding: '12px 20px' }}>Subject & Branch</th>
                    <th style={{ padding: '12px 20px' }}>Uploader</th>
                    <th style={{ padding: '12px 20px' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moderationList.map((res) => (
                    <tr key={res._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '240px' }}>
                        <Link to={`/resources/${res._id}`} style={{ color: 'inherit' }}>
                          {res.title}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {res.subject} • {res.branch}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {res.uploader?.name || 'Student'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          className={`badge ${
                            res.moderationStatus === 'approved'
                              ? 'badge-success'
                              : res.moderationStatus === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {res.moderationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Link to={`/resources/${res._id}`} className="btn btn-secondary btn-sm" title="Inspect">
                            <Eye size={14} />
                          </Link>
                          {res.moderationStatus !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleModerate(res._id, 'approved')}
                              className="btn btn-sm"
                              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}
                              title="Approve"
                            >
                              <Check size={14} />
                              Approve
                            </button>
                          )}
                          {res.moderationStatus !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleModerate(res._id, 'rejected')}
                              className="btn btn-sm"
                              style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}
                              title="Reject"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No resources found matching filter '{modFilter}'.
            </p>
          )}
        </div>
      )}

      {/* Tab: Reports Review */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['pending', 'resolved', 'dismissed', 'All'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReportFilter(s)}
                className={`btn btn-sm ${reportFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoadingReports ? (
            <SkeletonLoader count={4} type="table" />
          ) : reportsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reportsList.map((rep) => (
                <div
                  key={rep._id}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#FFFFFF',
                    borderLeft: `4px solid ${rep.status === 'pending' ? 'var(--danger-solid)' : 'var(--border-strong)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-danger">{rep.reason}</span>
                      <span className="badge badge-neutral">{rep.status}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Reported by {rep.reporter?.name} on {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {rep.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleResolveReport(rep._id, 'dismissed', false)}
                          className="btn btn-secondary btn-sm"
                        >
                          Dismiss Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveReport(rep._id, 'resolved', false)}
                          className="btn btn-primary btn-sm"
                        >
                          Mark Resolved
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveReport(rep._id, 'resolved', true)}
                          className="btn btn-danger btn-sm"
                          title="Delete offending material"
                        >
                          <Trash2 size={14} />
                          Remove Resource
                        </button>
                      </div>
                    )}
                  </div>

                  {rep.resource ? (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Flagged Resource:{' '}
                        <Link to={`/resources/${rep.resource._id}`} style={{ color: 'var(--primary-600)' }}>
                          {rep.resource.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Uploader: {rep.resource.uploader?.name} ({rep.resource.uploader?.email})
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Resource was previously deleted.
                    </div>
                  )}

                  {rep.details && (
                    <p style={{ marginTop: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Reporter Details:</strong> "{rep.details}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No reports under status '{reportFilter}'. Everything is in order!
            </p>
          )}
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'users' && (
        <div>
          {/* User Search & Role Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search user by name, email, branch..."
                className="form-input"
                style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px' }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Administrators</option>
            </select>

            <button type="button" onClick={fetchUsers} className="btn btn-primary btn-sm">
              Search Users
            </button>
          </div>

          {isLoadingUsers ? (
            <SkeletonLoader count={5} type="table" />
          ) : usersList.length > 0 ? (
            <div className="card" style={{ padding: '8px 0', backgroundColor: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 20px' }}>Name & Email</th>
                    <th style={{ padding: '12px 20px' }}>Branch & Semester</th>
                    <th style={{ padding: '12px 20px' }}>Role</th>
                    <th style={{ padding: '12px 20px' }}>Account Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {u.branch} • Sem {u.semester}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="btn btn-secondary btn-sm"
                            disabled={u._id === user._id}
                            title="Toggle Admin / Student role"
                          >
                            {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleUserActive(u)}
                            className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-secondary'}`}
                            disabled={u._id === user._id}
                            style={{ color: u.isActive ? 'var(--danger-solid)' : 'var(--success-solid)' }}
                            title={u.isActive ? 'Deactivate account' : 'Reactivate account'}
                          >
                            {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
              No users found matching your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

