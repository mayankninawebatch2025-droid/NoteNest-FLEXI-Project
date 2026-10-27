import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div className="skeleton" style={{ height: '24px', width: '90px' }} />
              <div className="skeleton" style={{ height: '24px', width: '60px' }} />
            </div>
            <div className="skeleton" style={{ height: '28px', width: '80%' }} />
            <div className="skeleton" style={{ height: '18px', width: '100%' }} />
            <div className="skeleton" style={{ height: '18px', width: '60%' }} />
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div className="skeleton" style={{ height: '20px', width: '100px' }} />
              <div className="skeleton" style={{ height: '20px', width: '70px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton"
            style={{ height: '52px', width: '100%', borderRadius: 'var(--radius-md)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ height: '40px', width: '60%' }} />
      <div className="skeleton" style={{ height: '20px', width: '100%' }} />
      <div className="skeleton" style={{ height: '20px', width: '80%' }} />
      <div className="skeleton" style={{ height: '300px', width: '100%' }} />
    </div>
  );
};

