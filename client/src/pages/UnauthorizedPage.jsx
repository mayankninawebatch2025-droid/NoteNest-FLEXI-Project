import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage = () => {
  const { isAuthenticated } = useAuth();

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
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <ShieldX size={36} />
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--danger-solid)', lineHeight: 1 }}>
          403
        </h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 8px' }}>
          Access Forbidden
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', lineHeight: 1.5 }}>
          You do not have administrative privileges to view this section. This area is reserved for faculty mentors and platform moderators.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Back to Home
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-secondary">
              <LogIn size={16} />
              Login as Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

