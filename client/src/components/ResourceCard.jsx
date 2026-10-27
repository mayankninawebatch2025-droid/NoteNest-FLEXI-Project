import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Star,
  Bookmark,
  Calendar,
  User as UserIcon,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export const ResourceCard = ({ resource, onBookmarkToggle, isBookmarked: initialBookmarked }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isBookmarked, setIsBookmarked] = React.useState(Boolean(initialBookmarked));
  const [isToggling, setIsToggling] = React.useState(false);

  React.useEffect(() => {
    setIsBookmarked(Boolean(initialBookmarked));
  }, [initialBookmarked]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please log in to bookmark study materials', 'warning');
      navigate('/login');
      return;
    }

    if (isToggling) return;
    setIsToggling(true);

    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${resource._id}`);
        setIsBookmarked(false);
        showToast('Removed from bookmarks', 'info');
      } else {
        await api.post(`/bookmarks/${resource._id}`);
        setIsBookmarked(true);
        showToast('Saved to your bookmarks!', 'success');
      }
      if (onBookmarkToggle) {
        onBookmarkToggle(resource._id, !isBookmarked);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update bookmark', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Handwritten Notes':
        return 'badge-lavender';
      case 'PYQ':
        return 'badge-warning';
      case 'Practical File':
      case 'Lab Manual':
        return 'badge-success';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div
      className="card card-interactive"
      onClick={() => navigate(`/resources/${resource._id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* Top Badges & Bookmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <span className={`badge ${getTypeBadgeClass(resource.resourceType)}`}>
            {resource.resourceType}
          </span>
          <span className="badge badge-neutral">
            Sem {resource.semester}
          </span>
        </div>

        <button
          type="button"
          onClick={handleBookmarkClick}
          disabled={isToggling}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
          style={{
            background: isBookmarked ? 'var(--primary-50)' : 'transparent',
            border: isBookmarked ? '1px solid var(--primary-100)' : 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isBookmarked ? 'var(--primary-600)' : 'var(--text-muted)',
            transition: 'all 150ms ease',
          }}
        >
          <Bookmark
            size={16}
            fill={isBookmarked ? 'var(--primary-600)' : 'transparent'}
          />
        </button>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: '8px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {resource.title}
      </h3>

      {/* Subject & Branch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.825rem',
          color: 'var(--primary-700)',
          fontWeight: 600,
          marginBottom: '10px',
        }}
      >
        <BookOpen size={14} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {resource.subject} • {resource.branch}
        </span>
      </div>

      {/* Truncated Description */}
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          lineHeight: 1.5,
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {resource.description || 'Verified academic resource uploaded for college coursework review.'}
      </p>

      {/* Footer Info: Rating, Downloads, Uploader */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: 600 }}>
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span>{resource.averageRating > 0 ? resource.averageRating.toFixed(1) : 'New'}</span>
            {resource.ratingCount > 0 && <span style={{ color: 'var(--text-muted)' }}>({resource.ratingCount})</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} />
            <span>{resource.downloadCount || 0}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <UserIcon size={13} />
          <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.uploader?.name?.split(' ')[0] || 'Student'}
          </span>
        </div>
      </div>
    </div>
  );
};

