import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export const RatingModal = ({ isOpen, currentRating = 0, currentComment = '', onSubmit, onClose }) => {
  const [rating, setRating] = useState(currentRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(currentComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Rate this Study Resource
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                How helpful was this resource for your studies?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: filled ? '#F59E0B' : 'var(--border-strong)',
                        transition: 'transform 100ms ease',
                      }}
                      title={`${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star size={32} fill={filled ? '#F59E0B' : 'transparent'} />
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D97706', marginTop: '6px', display: 'inline-block' }}>
                {rating === 5 && 'Outstanding & Highly Recommended!'}
                {rating === 4 && 'Very Good and Helpful'}
                {rating === 3 && 'Average Quality'}
                {rating === 2 && 'Needs Improvement'}
                {rating === 1 && 'Poor or Misleading Content'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="review-comment">
                Optional Review / Feedback
              </label>
              <textarea
                id="review-comment"
                className="form-textarea"
                rows={3}
                placeholder="Share specific topics, formula clarity, or handwriting legibility for fellow students..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <span className="form-hint" style={{ textAlign: 'right', display: 'block', marginTop: '4px' }}>
                {comment.length}/500
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

