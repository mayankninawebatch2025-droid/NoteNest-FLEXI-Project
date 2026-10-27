import React from 'react';
import { FolderSearch, Plus, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No resources found',
  description = 'Try adjusting your search criteria, filters, or branch selection.',
  actionLabel,
  actionTo,
  onAction,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '50px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '24px', fontSize: '0.95rem' }}>
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          <Plus size={16} />
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

