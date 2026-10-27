import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';

const REPORT_REASONS = [
  'Inappropriate Content',
  'Copyright Infringement',
  'Incorrect/Misleading Subject',
  'Corrupted File',
  'Spam/Advertisement',
  'Other',
];

export const ReportModal = ({ isOpen, onSubmit, onClose }) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ reason, details });
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flag size={20} color="var(--danger-solid)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Report Resource
              </h3>
            </div>
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Help keep NoteNest a safe, verified academic space. Our moderators will review this material promptly.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="report-reason">
                Reason for reporting
              </label>
              <select
                id="report-reason"
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="report-details">
                Additional Details (Optional)
              </label>
              <textarea
                id="report-details"
                className="form-textarea"
                rows={3}
                placeholder="Explain the specific issue (e.g. wrong semester syllabus, illegible page scans)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Reporting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

