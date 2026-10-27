import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

export const PdfPreviewModal = ({ isOpen, fileUrl, title, mimeType, onDownload, onClose }) => {
  if (!isOpen || !fileUrl) return null;

  const isPdf = mimeType === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf');
  const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(fileUrl);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95vw',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <FileText size={20} color="var(--primary-600)" style={{ flexShrink: 0 }} />
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Preview: {title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="btn btn-primary btn-sm"
                title="Download this file"
              >
                <Download size={14} />
                Download
              </button>
            )}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1E293B',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              title={title}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : isImage ? (
            <div style={{ padding: '20px', maxWidth: '100%', maxHeight: '100%' }}>
              <img
                src={fileUrl}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '460px',
                margin: '20px',
              }}
            >
              <FileText size={48} color="var(--primary-600)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                Preview Not Supported for this Format
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                This document ({mimeType || 'file'}) can be directly downloaded and opened in your preferred desktop application (Microsoft Word, PowerPoint, or text editor).
              </p>
              {onDownload && (
                <button type="button" onClick={onDownload} className="btn btn-primary">
                  <Download size={16} />
                  Download File Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

