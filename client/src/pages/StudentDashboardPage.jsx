import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Upload,
  Bookmark,
  Download,
  Star,
  FileText,
  Calendar,
  Trash2,
  Edit,
  Eye,
  Plus,
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationModal } from '../components/ConfirmationModal';
import api from '../api/client';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'bookmarks' | 'history'
  const [uploads, setUploads] = useState([]);
  const [uploadStats, setUploadStats] = useState({ total: 0, approved: 0, pending: 0, totalDownloads: 0 });
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal State
  const [editingResource, setEditingResource] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', subject: '', description: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resUploads, resBookmarks, resHistory] = await Promise.all([
        api.get('/users/me/resources'),
        api.get('/users/me/bookmarks'),
        api.get('/users/me/download-history'),
      ]);

      if (resUploads.success) {
        setUploads(resUploads.data || []);
        setUploadStats(resUploads.stats || { total: 0, approved: 0, pending: 0, totalDownloads: 0 });
      }

      if (resBookmarks.success) {
        setBookmarks(resBookmarks.data || []);
      }

      if (resHistory.success) {
        setHistory(resHistory.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete Resource
  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/resources/${resourceToDelete._id}`);
      if (res.success) {
        setUploads((prev) => prev.filter((r) => r._id !== resourceToDelete._id));
        showToast('Resource deleted successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
      setResourceToDelete(null);
    }
  };

  // Remove Bookmark
  const handleRemoveBookmark = async (resourceId) => {
    try {
      await api.delete(`/bookmarks/${resourceId}`);
      setBookmarks((prev) => prev.filter((b) => b.resource?._id !== resourceId));
      showToast('Bookmark removed', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove bookmark', 'error');
    }
  };

  // Edit Resource Save
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    setIsSavingEdit(true);
    try {
      const res = await api.put(`/resources/${editingResource._id}`, editFormData);
      if (res.success) {
        setUploads((prev) =>
          prev.map((r) => (r._id === editingResource._id ? { ...r, ...editFormData } : r))
        );
        showToast('Resource updated successfully!', 'success');
        setEditingResource(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resource', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Profile Overview Banner */}
      <div
        className="card"
        style={{
          padding: '32px',
          backgroundColor: '#FFFFFF',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                {user?.name}
              </h1>
              <span className="badge badge-lavender">
                {user?.role === 'admin' ? 'Administrator' : `Semester ${user?.semester}`}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              {user?.email} • {user?.branch}
            </div>
            {user?.bio && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', maxWidth: '500px' }}>
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/upload" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Upload New Notes
          </Link>
          <Link to="/profile" className="btn btn-secondary btn-sm">
            <User size={16} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              My Uploads
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {uploadStats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {uploadStats.approved} approved • {uploadStats.pending} pending
          </div>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-lavender-subtle)',
                color: 'var(--accent-lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Saved Bookmarks
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {bookmarks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Quick access library
          </div>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Downloads Received
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {uploadStats.totalDownloads}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Students benefited
          </div>
        </div>

        <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--warning-bg)',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Materials Read
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {history.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Downloaded from peers
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '28px',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('uploads')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'uploads' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'uploads' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'uploads' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
          }}
        >
          <Upload size={16} />
          My Uploaded Notes ({uploads.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'bookmarks' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'bookmarks' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'bookmarks' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
          }}
        >
          <Bookmark size={16} />
          Bookmarked Materials ({bookmarks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'history' ? 'var(--primary-600)' : 'transparent'}`,
            color: activeTab === 'history' ? 'var(--primary-600)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'history' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
          }}
        >
          <Clock size={16} />
          Download History ({history.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <SkeletonLoader count={3} type="table" />
      ) : activeTab === 'uploads' ? (
        uploads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {uploads.map((res) => (
              <div
                key={res._id}
                className="card"
                style={{
                  padding: '20px 24px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-lavender" style={{ fontSize: '0.75rem' }}>
                      {res.resourceType}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      Sem {res.semester}
                    </span>
                    <span
                      className={`badge ${
                        res.moderationStatus === 'approved'
                          ? 'badge-success'
                          : res.moderationStatus === 'rejected'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {res.moderationStatus}
                    </span>
                  </div>

                  <Link
                    to={`/resources/${res._id}`}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {res.title}
                  </Link>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                    <span>{res.subject}</span>
                    <span>•</span>
                    <span>{res.downloadCount || 0} downloads</span>
                    <span>•</span>
                    <span>⭐ {res.averageRating > 0 ? res.averageRating.toFixed(1) : 'New'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link to={`/resources/${res._id}`} className="btn btn-secondary btn-sm" title="View details">
                    <Eye size={15} />
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingResource(res);
                      setEditFormData({
                        title: res.title,
                        subject: res.subject,
                        description: res.description || '',
                      });
                    }}
                    className="btn btn-secondary btn-sm"
                    title="Edit info"
                  >
                    <Edit size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceToDelete(res)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger-solid)' }}
                    title="Delete upload"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="You haven't uploaded any study resources yet"
            description="Share your lecture notes, handwritten formulas, or practical files to help fellow students."
            actionLabel="Upload First Note"
            actionTo="/upload"
          />
        )
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {bookmarks.map((bm) => (
              <div
                key={bm._id}
                className="card card-interactive"
                style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="badge badge-lavender">{bm.resource.resourceType}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBookmark(bm.resource._id)}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px', color: 'var(--danger-solid)' }}
                    title="Remove from bookmarks"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <Link
                  to={`/resources/${bm.resource._id}`}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    lineHeight: 1.4,
                  }}
                >
                  {bm.resource.title}
                </Link>

                <div style={{ fontSize: '0.825rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '8px' }}>
                  {bm.resource.subject} • {bm.resource.branch}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>⭐ {bm.resource.averageRating || 'New'}</span>
                  <span>{bm.resource.downloadCount || 0} downloads</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No bookmarks saved yet"
            description="Explore our repository and bookmark resources to keep them handy for exam revision."
            actionLabel="Browse Resources"
            actionTo="/explore"
          />
        )
      ) : (
        /* History Tab */
        history.length > 0 ? (
          <div className="card" style={{ padding: '8px 0', backgroundColor: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 20px' }}>Resource Title</th>
                  <th style={{ padding: '12px 20px' }}>Subject & Branch</th>
                  <th style={{ padding: '12px 20px' }}>Type</th>
                  <th style={{ padding: '12px 20px' }}>Downloaded On</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Link to={`/resources/${h.resource._id}`} style={{ color: 'inherit' }}>
                        {h.resource.title}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                      {h.resource.subject}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge badge-neutral">{h.resource.resourceType}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                      {new Date(h.downloadedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Link to={`/resources/${h.resource._id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No download history yet"
            description="Materials you download will appear here so you can easily reference them again."
            actionLabel="Find Study Materials"
            actionTo="/explore"
          />
        )
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(resourceToDelete)}
        title="Delete Uploaded Note?"
        message={`Are you sure you want to permanently delete "${resourceToDelete?.title}"?`}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setResourceToDelete(null)}
      />

      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="modal-overlay" onClick={() => setEditingResource(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Edit Study Material
                </h3>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    className="form-input"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-subject">Subject</label>
                  <input
                    id="edit-subject"
                    className="form-input"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    className="form-textarea"
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingEdit}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

