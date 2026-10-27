import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  X,
} from 'lucide-react';
import { ResourceCard } from '../components/ResourceCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import api from '../api/client';

const BRANCHES = [
  'All',
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Other',
];

const RESOURCE_TYPES = [
  'All',
  'Notes',
  'Handwritten Notes',
  'Practical File',
  'Lab Manual',
  'PYQ',
  'Syllabus',
  'Reference Book',
  'Other',
];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [branch, setBranch] = useState(searchParams.get('branch') || 'All');
  const [semester, setSemester] = useState(searchParams.get('semester') || 'All');
  const [resourceType, setResourceType] = useState(searchParams.get('type') || 'All');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchTerm.trim(),
        branch: branch !== 'All' ? branch : undefined,
        semester: semester !== 'All' ? semester : undefined,
        resourceType: resourceType !== 'All' ? resourceType : undefined,
        subject: subject.trim() || undefined,
        sort,
        page,
        limit: 9,
      };

      const res = await api.get('/resources', params);
      if (res.success) {
        setResources(res.data || []);
        setPagination(res.pagination || { totalCount: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, branch, semester, resourceType, subject, sort, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Sync URL search params
  const updateUrlParams = useCallback(() => {
    const nextParams = {};
    if (searchTerm) nextParams.search = searchTerm;
    if (branch !== 'All') nextParams.branch = branch;
    if (semester !== 'All') nextParams.semester = semester;
    if (resourceType !== 'All') nextParams.type = resourceType;
    if (subject) nextParams.subject = subject;
    if (sort !== 'newest') nextParams.sort = sort;
    if (page > 1) nextParams.page = page.toString();
    setSearchParams(nextParams, { replace: true });
  }, [searchTerm, branch, semester, resourceType, subject, sort, page, setSearchParams]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setBranch('All');
    setSemester('All');
    setResourceType('All');
    setSubject('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || branch !== 'All' || semester !== 'All' || resourceType !== 'All' || subject || sort !== 'newest';

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
          Explore Study Materials
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
          Browse verified lecture notes, handwritten sheets, lab manuals, and previous year question papers.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by title, topic, or keyword (e.g. Graph, Dijkstra, OSI)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            Search
          </button>

          <button
            type="button"
            className="btn btn-secondary hide-on-desktop"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </form>

        {/* Filter Controls Row (Desktop) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
          className={showMobileFilters ? '' : 'hide-on-mobile'}
        >
          {/* Branch Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.785rem' }}>Branch</label>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPage(1);
              }}
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.785rem' }}>Semester</label>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.785rem' }}>Resource Type</label>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <label className="form-label" style={{ fontSize: '0.785rem' }}>Sort By</label>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters & Reset Indicator */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px dashed var(--border-subtle)',
              fontSize: '0.825rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Filters:</span>
              {branch !== 'All' && <span className="badge badge-primary">{branch}</span>}
              {semester !== 'All' && <span className="badge badge-neutral">Sem {semester}</span>}
              {resourceType !== 'All' && <span className="badge badge-lavender">{resourceType}</span>}
              {searchTerm && <span className="badge badge-warning">"{searchTerm}"</span>}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger-solid)', padding: '2px 8px' }}
            >
              <RotateCcw size={14} />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Results Header (Count & View Mode) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Showing{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {pagination.totalCount}
          </strong>{' '}
          academic resources
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 10px' }}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Resources Display */}
      {isLoading ? (
        <SkeletonLoader count={6} type="card" />
      ) : resources.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
            gap: '24px',
          }}
        >
          {resources.map((res) => (
            <ResourceCard key={res._id} resource={res} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No study resources match your criteria"
          description="Try broadening your search query or selecting a different branch/semester."
          actionLabel="Reset Search & Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '48px',
          }}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '36px', padding: '6px 10px' }}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

