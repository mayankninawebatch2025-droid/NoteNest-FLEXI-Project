const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
      index: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

downloadHistorySchema.index({ user: 1, downloadedAt: -1 });

const DownloadHistory = mongoose.model('DownloadHistory', downloadHistorySchema);
module.exports = DownloadHistory;

