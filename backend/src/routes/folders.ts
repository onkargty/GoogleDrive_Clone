import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createFolder,
  getFolders,
  deleteFolder,
  renameFolder
} from '../controllers/folderController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Folder routes
router.post('/', createFolder);
router.get('/', getFolders);
router.delete('/:folderId', deleteFolder);
router.put('/:folderId/rename', renameFolder);

export default router;