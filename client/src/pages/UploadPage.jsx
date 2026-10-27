import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const BRANCHES = [
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
  'Notes',
  'Handwritten Notes',
  'Practical File',
  'Lab Manual',
  'PYQ',
  'Syllabus',
  'Reference Book',
  'Other',
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.txt',
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
];

export const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    branch: user?.branch || 'Computer Science',
    semester: user?.semester || 3,
    resourceType: 'Notes',
    tags: '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Check size limit: 25MB
    const maxSize = 25 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setErrorMsg('File size exceeds the 25MB maximum limit.');
      return false;
    }

    // Check extension
    const name = selectedFile.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!isAllowed) {
      setErrorMsg(
        'Unsupported file format. Please upload PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), TXT, or ZIP.'
      );
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
      // Auto-populate title if empty
      if (!formData.title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setFormData((prev) => ({ ...prev, title: cleanName }));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      if (!formData.title) {
        const cleanName = droppedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setFormData((prev) => ({ ...prev, title: cleanName }));
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg('Please select or drop a file to upload.');
      return;
    }

    if (!formData.title.trim() || !formData.subject.trim()) {
      setErrorMsg('Please provide a title and subject for this resource.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('subject', formData.subject.trim());
      data.append('branch', formData.branch);
      data.append('semester', formData.semester);
      data.append('resourceType', formData.resourceType);
      data.append('tags', formData.tags.trim());

      const res = await api.upload('/resources', data, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success && res.data) {
        showToast('Study material published successfully!', 'success');
        navigate(`/resources/${res.data._id}`);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'File upload failed. Please try again.');
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '820px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-lavender" style={{ marginBottom: '8px' }}>
          Contribution Portal
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
          Upload Study Material
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
          Share your high-quality lecture notes, practical records, and solved question papers with fellow students.
        </p>
      </div>

      {/* Upload Form Card */}
      <div className="card" style={{ padding: '36px', backgroundColor: '#FFFFFF' }}>
        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              fontSize: '0.9rem',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Drag & Drop File Upload Area */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">
              Upload Document File (Max 25MB)
            </label>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--primary-500)' : 'var(--border-strong)'}`,
                  backgroundColor: isDragging ? 'var(--primary-50)' : 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Click to browse or drag and drop your file here
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Supported formats: PDF, DOCX, DOC, PPTX, PPT, TXT, ZIP, Images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--primary-50)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-600)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '6px',
                  }}
                  title="Remove file"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Resource Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Complete Operating Systems Notes (Semaphores & Virtual Memory)"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Subject & Resource Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="subject">
                Subject Name *
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="form-input"
                placeholder="e.g. Data Structures, Computer Networks"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resourceType">
                Resource Type *
              </label>
              <select
                id="resourceType"
                name="resourceType"
                className="form-select"
                value={formData.resourceType}
                onChange={handleChange}
                required
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Branch & Semester */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="branch">
                Department / Branch *
              </label>
              <select
                id="branch"
                name="branch"
                className="form-select"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="semester">
                Semester *
              </label>
              <select
                id="semester"
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label" htmlFor="tags">
              Topic Tags (Comma Separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="form-input"
              placeholder="e.g. Trees, Algorithms, Mid-Sem, Unit 2"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description & Syllabus Topics
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              rows={4}
              placeholder="Explain key modules covered, exam relevance, formula sheets included, or lab experiment numbers..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--primary-700)',
                }}
              >
                <span>Uploading study material...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${uploadProgress}%`,
                    backgroundColor: 'var(--primary-600)',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '14px' }}
            disabled={isUploading}
          >
            {isUploading ? (
              'Processing Upload...'
            ) : (
              <>
                <FileCheck size={20} />
                Publish Study Resource
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

