import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Github, Heart, ShieldCheck, Database, Server, Code } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        padding: '60px 0 24px',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary-600)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                NoteNest
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Smart Study Material Sharing Platform designed for engineering and college scholars. Discover, upload, preview, and review verified notes, practical files, and previous year university exam questions.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">FLEXI Capstone</span>
              <span className="badge badge-lavender">MERN Stack</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/explore" style={{ color: 'var(--text-secondary)', transition: 'color 150ms' }}>
                  Explore All Notes & PYQs
                </Link>
              </li>
              <li>
                <Link to="/upload" style={{ color: 'var(--text-secondary)' }}>
                  Upload Study Material
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/explore?type=Handwritten%20Notes" style={{ color: 'var(--text-secondary)' }}>
                  Handwritten Notes
                </Link>
              </li>
              <li>
                <Link to="/explore?type=PYQ" style={{ color: 'var(--text-secondary)' }}>
                  Solved Question Papers
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Branches */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Academic Branches
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <Link to="/explore?branch=Computer%20Science" style={{ color: 'var(--text-secondary)' }}>
                  Computer Science & Engg
                </Link>
              </li>
              <li>
                <Link to="/explore?branch=Information%20Technology" style={{ color: 'var(--text-secondary)' }}>
                  Information Technology
                </Link>
              </li>
              <li>
                <Link to="/explore?branch=Electronics%20%26%20Communication" style={{ color: 'var(--text-secondary)' }}>
                  Electronics & Communication
                </Link>
              </li>
              <li>
                <Link to="/explore?branch=Mechanical%20Engineering" style={{ color: 'var(--text-secondary)' }}>
                  Mechanical Engineering
                </Link>
              </li>
              <li>
                <Link to="/explore?branch=Civil%20Engineering" style={{ color: 'var(--text-secondary)' }}>
                  Civil Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech Specs */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              System Architecture
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={15} color="var(--primary-600)" />
                <span>React 18 + Vite SPA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={15} color="var(--primary-600)" />
                <span>Node.js & Express REST APIs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={15} color="var(--primary-600)" />
                <span>MongoDB + Mongoose ODM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={15} color="var(--primary-600)" />
                <span>JWT & Bcrypt Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} NoteNest. Built with care for College FLEXI Project Evaluation.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>MongoDB Compass Inspectable</span>
            <span>•</span>
            <span>Role-Based Access Control</span>
            <span>•</span>
            <span>Verified Document Previews</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

