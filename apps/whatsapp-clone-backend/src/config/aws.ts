import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
  secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
  region: process.env['AWS_REGION'] || 'us-east-1',
});

// S3 Configuration
export const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
});

// CloudFront Configuration
export const cloudFront = new AWS.CloudFront({
  apiVersion: '2020-05-31',
});

// S3 Bucket Configuration
export const S3_CONFIG = {
  bucket: process.env['AWS_S3_BUCKET'] || 'whatsapp-clone-media',
  region: process.env['AWS_REGION'] || 'us-east-1',
  cloudFrontDomain: process.env['AWS_CLOUDFRONT_DOMAIN'],
};

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB
  allowedFileTypes: (process.env['ALLOWED_FILE_TYPES'] || '').split(','),
  imageProcessing: {
    quality: 80,
    format: 'webp',
    sizes: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
    },
  },
  videoProcessing: {
    qualities: {
      low: { resolution: '480p', bitrate: '500k' },
      medium: { resolution: '720p', bitrate: '1M' },
      high: { resolution: '1080p', bitrate: '2M' },
    },
    thumbnail: { width: 320, height: 180 },
  },
  audioProcessing: {
    codec: 'opus',
    bitrate: '128k',
    sampleRate: 48000,
    waveform: { width: 300, height: 60, color: '#4CAF50' },
  },
}; 