import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  uploadFile,
  getFiles,
  deleteFile,
  downloadFile
} from '../controllers/fileController';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// All routes require authentication
router.use(authenticateToken);

// File routes
router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.delete('/:fileId', deleteFile);
router.get('/:fileId/download', downloadFile);

export default router;