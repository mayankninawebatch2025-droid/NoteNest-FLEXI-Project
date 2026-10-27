import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, BookOpen } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '500px',
          padding: '48px 32px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <FileQuestion size={36} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-900)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 8px' }}>
          Page or Study Note Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.5 }}>
          The lecture note, past paper, or page you were looking for might have been moved, renamed, or deleted by its author.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Go to Homepage
          </Link>
          <Link to="/explore" className="btn btn-secondary">
            <BookOpen size={16} />
            Explore Notes
          </Link>
        </div>
      </div>
    </div>
  );
};

