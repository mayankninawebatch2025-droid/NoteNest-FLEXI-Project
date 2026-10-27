const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for the resource'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: [
        'Computer Science',
        'Information Technology',
        'Electronics & Communication',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Chemical Engineering',
        'Other',
      ],
      index: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
      index: true,
    },
    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: [
        'Notes',
        'Handwritten Notes',
        'Practical File',
        'Lab Manual',
        'PYQ',
        'Syllabus',
        'Reference Book',
        'Other',
      ],
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    storageIdentifier: {
      type: String,
      required: [true, 'Storage identifier is required'],
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'], // in bytes
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
    moderationNote: {
      type: String,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound text index for robust full-text search across title, subject, and description
resourceSchema.index(
  {
    title: 'text',
    subject: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 10,
      subject: 5,
      description: 1,
    },
    name: 'ResourceTextSearchIndex',
  }
);

// Compound indexes for common multi-attribute filters
resourceSchema.index({ branch: 1, semester: 1, resourceType: 1 });
resourceSchema.index({ moderationStatus: 1, createdAt: -1 });

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;

