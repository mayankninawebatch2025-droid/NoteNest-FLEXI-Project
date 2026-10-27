import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Upload,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/explore?search=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-600)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(67, 56, 202, 0.25)',
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)', letterSpacing: '-0.02em' }}>
                NoteNest
              </span>
              <span className="badge badge-lavender" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                FLEXI
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '-3px' }}>
              Smart Study Platform
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleQuickSearch}
          className="hide-on-mobile"
          style={{
            flex: '1',
            maxWidth: '380px',
            position: 'relative',
          }}
        >
          <Search
            size={16}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search notes, PYQs, subjects, lab files..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.borderColor = 'var(--primary-500)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'var(--bg-subtle)';
              e.target.style.borderColor = 'var(--border-strong)';
            }}
          />
        </form>

        {/* Navigation Links (Desktop) */}
        <nav
          className="hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link
            to="/explore"
            className="btn btn-ghost btn-sm"
            style={{
              color: isActive('/explore') ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: isActive('/explore') ? 700 : 500,
            }}
          >
            Explore Resources
          </Link>

          <Link
            to="/upload"
            className="btn btn-ghost btn-sm"
            style={{
              color: isActive('/upload') ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: isActive('/upload') ? 700 : 500,
            }}
          >
            <Upload size={16} />
            Upload
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="btn btn-sm"
              style={{
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                border: '1px solid var(--primary-100)',
                fontWeight: 600,
              }}
            >
              <ShieldAlert size={16} />
              Admin Portal
            </Link>
          )}

          {/* User Profile Dropdown or Auth Buttons */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
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
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    padding: '8px 0',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-xl)',
                    animation: 'slideIn 150ms ease',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {user?.email}
                    </div>
                    <span className="badge badge-lavender" style={{ marginTop: '6px', fontSize: '0.7rem' }}>
                      {user?.role === 'admin' ? 'Administrator' : `${user?.branch} • Sem ${user?.semester}`}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px' }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 16px' }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Account Settings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="btn btn-ghost btn-sm"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '8px 16px',
                        color: 'var(--primary-600)',
                        fontWeight: 600,
                      }}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ShieldAlert size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '6px 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-ghost btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '8px 16px',
                      color: 'var(--danger-solid)',
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="hide-on-desktop"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-primary)',
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div
          className="hide-on-desktop"
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <form onSubmit={handleQuickSearch}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="var(--text-muted)"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                placeholder="Search notes, PYQs, subjects..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </form>

          <Link to="/explore" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <BookOpen size={18} />
            Explore Resources
          </Link>

          <Link to="/upload" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
            <Upload size={18} />
            Upload Study Material
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <LayoutDashboard size={18} />
                Student Dashboard
              </Link>
              <Link to="/profile" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <Settings size={18} />
                Edit Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--primary-600)' }}>
                  <ShieldAlert size={18} />
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', color: 'var(--danger-solid)', marginTop: '8px' }}
              >
                <LogOut size={18} />
                Sign Out ({user?.name})
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

