import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  Star,
  Calendar,
  User as UserIcon,
  BookOpen,
  ArrowLeft,
  Share2,
  Flag,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { RatingModal } from '../components/RatingModal';
import { ReportModal } from '../components/ReportModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import api from '../api/client';

export const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [resource, setResource] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/resources/${id}`);
        if (res.success) {
          setResource(res.data);
          setReviews(res.reviews || []);
          setIsBookmarked(Boolean(res.isBookmarked));
          setUserReview(res.userReview || null);
        }
      } catch (err) {
        showToast(err.message || 'Resource not found', 'error');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, showToast]);

  // Handle Download
  const handleDownload = async () => {
    if (!resource) return;
    setIsDownloading(true);
    try {
      const res = await api.post(`/resources/${resource._id}/download`);
      if (res.success && res.downloadUrl) {
        // Increment download count locally
        setResource((prev) => ({
          ...prev,
          downloadCount: res.downloadCount || prev.downloadCount + 1,
        }));

        // Trigger file download in browser
        const link = document.createElement('a');
        link.href = res.downloadUrl;
        link.download = res.filename || resource.originalFilename || 'study_material';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Download started successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to download file', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Bookmark Toggle
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to bookmark study materials', 'warning');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${resource._id}`);
        setIsBookmarked(false);
        showToast('Removed from your bookmarks', 'info');
      } else {
        await api.post(`/bookmarks/${resource._id}`);
        setIsBookmarked(true);
        showToast('Saved to your bookmarks!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Could not update bookmark', 'error');
    }
  };

  // Handle Rating Submit
  const handleRatingSubmit = async ({ rating, comment }) => {
    try {
      const res = await api.post(`/resources/${resource._id}/reviews`, { rating, comment });
      if (res.success) {
        setUserReview(res.review);
        setResource((prev) => ({
          ...prev,
          averageRating: res.averageRating,
          ratingCount: res.ratingCount,
        }));

        // Refresh reviews list
        const updatedReviews = await api.get(`/resources/${resource._id}`);
        if (updatedReviews.success) {
          setReviews(updatedReviews.reviews || []);
        }

        showToast('Thank you for rating this resource!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit rating', 'error');
      throw err;
    }
  };

  // Handle Report Submit
  const handleReportSubmit = async ({ reason, details }) => {
    try {
      const res = await api.post(`/resources/${resource._id}/reports`, { reason, details });
      if (res.success) {
        showToast('Report submitted for admin review. Thank you!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
      throw err;
    }
  };

  // Handle Delete
  const handleDeleteResource = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/resources/${resource._id}`);
      if (res.success) {
        showToast('Resource deleted successfully', 'success');
        navigate('/explore');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // Share URL
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: `Check out ${resource?.title} on NoteNest!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '60px 20px' }}>
        <SkeletonLoader count={1} type="detail" />
      </div>
    );
  }

  if (!resource) return null;

  const isOwner = user && resource.uploader?._id?.toString() === user._id?.toString();
  const canEditOrDelete = isOwner || isAdmin;
  const isPdf = resource.mimeType === 'application/pdf' || resource.fileUrl?.endsWith('.pdf');

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '24px', paddingLeft: 0 }}
      >
        <ArrowLeft size={16} />
        Back to Resources
      </button>

      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Resource Details, In-line Preview, Reviews */}
        <div>
          {/* Header Card */}
          <div className="card" style={{ padding: '32px', marginBottom: '28px' }}>
            {/* Badges & Moderation State */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <span className="badge badge-lavender" style={{ fontSize: '0.825rem' }}>
                {resource.resourceType}
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.825rem' }}>
                {resource.branch}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.825rem' }}>
                Semester {resource.semester}
              </span>
              {resource.moderationStatus === 'pending' && (
                <span className="badge badge-warning">Pending Moderation</span>
              )}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
                fontWeight: 800,
                color: 'var(--primary-900)',
                lineHeight: 1.3,
                marginBottom: '16px',
              }}
            >
              {resource.title}
            </h1>

            {/* Subject */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                color: 'var(--primary-700)',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <BookOpen size={18} />
              <span>{resource.subject}</span>
            </div>

            {/* Description */}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.7, marginBottom: '28px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                About this Material:
              </h4>
              <p style={{ whiteSpace: 'pre-line' }}>{resource.description || 'No detailed description provided.'}</p>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
                {resource.tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.785rem',
                      padding: '4px 10px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions Toolbar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={handleDownload}
                className="btn btn-primary"
                disabled={isDownloading}
              >
                <Download size={18} />
                {isDownloading ? 'Starting Download...' : `Download File (${(resource.fileSize / (1024 * 1024)).toFixed(2)} MB)`}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="btn btn-secondary"
              >
                <Eye size={18} />
                Preview Document
              </button>

              <button
                type="button"
                onClick={handleBookmarkToggle}
                className="btn btn-secondary"
                style={{
                  color: isBookmarked ? 'var(--primary-600)' : 'var(--text-secondary)',
                  borderColor: isBookmarked ? 'var(--primary-500)' : 'var(--border-strong)',
                }}
              >
                <Bookmark size={18} fill={isBookmarked ? 'var(--primary-600)' : 'transparent'} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>

              <button type="button" onClick={handleShare} className="btn btn-secondary">
                <Share2 size={16} />
                Share
              </button>

              {isAuthenticated && !isOwner && (
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="btn btn-ghost"
                  style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}
                  title="Report inappropriate content"
                >
                  <Flag size={16} />
                  Report
                </button>
              )}
            </div>
          </div>

          {/* Document In-Line Preview Card (if PDF) */}
          {isPdf && (
            <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--primary-600)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Document Reader Preview
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye size={14} />
                  Fullscreen View
                </button>
              </div>

              <div
                style={{
                  height: '480px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#1E293B',
                }}
              >
                <iframe
                  src={`${resource.fileUrl}#toolbar=0&navpanes=0`}
                  title={resource.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Student Reviews & Ratings Section */}
          <div className="card" style={{ padding: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  Student Reviews & Feedback
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', color: '#F59E0B' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={resource.averageRating >= star ? '#F59E0B' : 'transparent'}
                        color={resource.averageRating >= star ? '#F59E0B' : 'var(--border-strong)'}
                      />
                    ))}
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {resource.averageRating > 0 ? resource.averageRating.toFixed(1) : 'No ratings yet'}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ({resource.ratingCount} {resource.ratingCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in to rate this study material', 'warning');
                    navigate('/login');
                  } else {
                    setIsRatingOpen(true);
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                <Star size={16} color="#D97706" />
                {userReview ? 'Edit Your Rating' : 'Rate this Resource'}
              </button>
            </div>

            {/* User's own review badge if already rated */}
            {userReview && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--primary-50)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--primary-100)',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>Your Review: </span>
                <span>⭐ {userReview.rating}/5 — "{userReview.comment || 'No comment provided'}"</span>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-600)',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {rev.user?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {rev.user?.name || 'Verified Student'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {rev.user?.branch}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={rev.rating >= s ? '#F59E0B' : 'transparent'}
                            color={rev.rating >= s ? '#F59E0B' : 'var(--border-strong)'}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>
                Be the first scholar to review this study material!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Uploader Card & File Metadata & Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Uploader Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Uploaded By
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {resource.uploader?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {resource.uploader?.name || 'Anonymous Student'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {resource.uploader?.branch || 'Engineering Department'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="var(--text-muted)" />
                <span>Uploaded on {new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={15} color="var(--text-muted)" />
                <span>{resource.downloadCount || 0} total downloads</span>
              </div>
            </div>
          </div>

          {/* File Metadata Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              File Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Original File:</span>
                <span
                  style={{
                    fontWeight: 600,
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={resource.originalFilename}
                >
                  {resource.originalFilename}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>File Size:</span>
                <span style={{ fontWeight: 600 }}>{(resource.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Format:</span>
                <span style={{ fontWeight: 600 }}>{resource.mimeType || 'Document'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{resource.storageProvider || 'Local'}</span>
              </div>
            </div>
          </div>

          {/* Owner / Admin Management Card */}
          {canEditOrDelete && (
            <div
              className="card"
              style={{
                padding: '24px',
                border: '1px solid var(--accent-lavender-border)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '12px' }}>
                Manage This Resource
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {isOwner ? 'You are the author of this study material.' : 'You have administrative moderation privileges.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%' }}
                >
                  <Trash2 size={16} />
                  Delete Resource
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        fileUrl={resource.fileUrl}
        title={resource.title}
        mimeType={resource.mimeType}
        onDownload={handleDownload}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Rating & Review Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        currentRating={userReview?.rating || 5}
        currentComment={userReview?.comment || ''}
        onSubmit={handleRatingSubmit}
        onClose={() => setIsRatingOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onSubmit={handleReportSubmit}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Study Material?"
        message="Are you sure you want to permanently delete this resource? All associated student reviews, bookmarks, and files will be removed. This action cannot be undone."
        confirmText="Yes, Delete Permanently"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteResource}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

