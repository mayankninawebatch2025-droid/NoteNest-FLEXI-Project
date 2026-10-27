import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ArrowRight,
  Upload,
  Download,
  Users,
  Star,
  FileCheck,
  CheckCircle,
  Sparkles,
  Layers,
  Shield,
  Eye,
} from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import api from '../api/client';

const QUICK_SUBJECTS = [
  'Data Structures and Algorithms',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Artificial Intelligence',
  'Digital Signal Processing',
  'Engineering Thermodynamics',
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularResources, setPopularResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [stats, setStats] = useState({ totalResources: 0, totalDownloads: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/resources/highlights');
        if (res.success) {
          setPopularResources(res.popular || []);
          setRecentResources(res.recent || []);
          setStats(res.stats || { totalResources: 0, totalDownloads: 0 });
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, var(--bg-page) 100%)',
          padding: '70px 0 40px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              color: 'var(--primary-700)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} color="var(--accent-lavender)" />
            NoteNest • Smart Study Material Sharing Platform
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 800,
              color: 'var(--primary-900)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '18px',
            }}
          >
            Study Smarter, Not Harder.{' '}
            <span style={{ color: 'var(--primary-600)' }}>Every Note You Need.</span>
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 32px',
            }}
          >
            The centralized open repository for college students. Access syllabus-aligned handwritten notes, verified lab files, university PYQs, and lecture summaries curated by top rankers.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleHeroSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-full)',
              padding: '6px 8px 6px 20px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-strong)',
              maxWidth: '640px',
              margin: '0 auto 20px',
            }}
          >
            <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search by subject, topic (e.g. Trees, Semaphores, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '1rem',
                color: 'var(--text-primary)',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Search Notes
            </button>
          </form>

          {/* Quick Subject Chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Popular:</span>
            {QUICK_SUBJECTS.slice(0, 5).map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => navigate(`/explore?search=${encodeURIComponent(subj)}`)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '0.785rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--primary-500)';
                  e.target.style.color = 'var(--primary-600)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border-subtle)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Call to Actions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '14px',
              marginTop: '36px',
            }}
          >
            <Link to="/explore" className="btn btn-primary btn-lg">
              <BookOpen size={18} />
              Browse Study Materials
            </Link>
            <Link to="/upload" className="btn btn-secondary btn-lg">
              <Upload size={18} />
              Upload Your Notes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="container">
        <div
          className="card"
          style={{
            padding: '30px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
              {stats.totalResources > 0 ? `${stats.totalResources}+` : '8+'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Verified Study Resources
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-lavender)' }}>
              {stats.totalDownloads > 0 ? `${stats.totalDownloads}+` : '750+'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Total Downloads & Reads
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success-solid)' }}>
              8 Semesters
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Comprehensive Branch Coverage
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706' }}>
              4.8 / 5.0
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Average Peer Rating
            </div>
          </div>
        </div>
      </section>

      {/* Popular Resources Section */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div className="badge badge-lavender" style={{ marginBottom: '8px' }}>
              Top Trending
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              Popular Study Materials
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Most downloaded and highest-rated notes across all engineering departments.
            </p>
          </div>

          <Link to="/explore?sort=popular" className="btn btn-secondary btn-sm">
            View All Trending
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonLoader count={3} type="card" />
        ) : popularResources.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {popularResources.slice(0, 3).map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No resources uploaded yet.</p>
        )}
      </section>

      {/* Features Highlights Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '70px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
              Engineered For Academics
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '12px' }}>
              Why College Scholars Rely On NoteNest
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Everything you need to conquer your mid-semester, end-semester, and university practical examinations with confidence.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            <div className="card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Granular Filtering
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Filter precisely by your specific Engineering Branch, Semester (1-8), Subject Name, and Document Type (Notes, Lab Manuals, PYQs).
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-lavender-subtle)',
                  color: 'var(--accent-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Eye size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                In-App Document Previews
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Read PDF notes, lab code, and formulas directly inside your browser modal without needing to consume device storage first.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Star size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Authentic Peer Ratings
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                One student, one rating. Transparent feedback and reviews highlight the most legible, complete, and exam-relevant materials.
              </p>
            </div>

            <div className="card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--warning-bg)',
                  color: 'var(--warning-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                Moderated Content Quality
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Active administrator and student reporting tools safeguard against misleading subjects, duplicate uploads, and corrupt files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Uploaded Resources Section */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
              Fresh Uploads
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              Recently Uploaded Notes
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              The latest study documents shared by fellow students and faculty mentors.
            </p>
          </div>

          <Link to="/explore?sort=newest" className="btn btn-secondary btn-sm">
            View All Recent
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonLoader count={3} type="card" />
        ) : recentResources.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {recentResources.slice(0, 3).map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No resources uploaded yet.</p>
        )}
      </section>

      {/* College Project Evaluation Callout Banner */}
      <section className="container">
        <div
          className="card"
          style={{
            padding: '48px',
            backgroundColor: 'var(--primary-900)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              filter: 'blur(30px)',
            }}
          />

          <span
            className="badge badge-lavender"
            style={{ backgroundColor: 'rgba(237, 233, 254, 0.15)', color: '#DDD6FE', border: '1px solid rgba(221, 214, 254, 0.3)' }}
          >
            College FLEXI Project Showcase
          </span>

          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, maxWidth: '640px', lineHeight: 1.2 }}>
            Ready to Share Your Notes with the College Community?
          </h2>

          <p style={{ color: '#CBD5E1', maxWidth: '540px', fontSize: '1rem', lineHeight: 1.6 }}>
            Sign up in seconds, upload your handwritten or typed study materials, and help your peers excel in semester examinations.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-500)', color: '#FFFFFF' }}>
              Create Student Account
            </Link>
            <Link to="/explore" className="btn btn-secondary" style={{ backgroundColor: 'transparent', color: '#FFFFFF', borderColor: '#475569' }}>
              Explore Library First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

