import express from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', authenticateToken, getProjects)
router.get('/:id', authenticateToken, getProjectById)
router.post('/', authenticateToken, requireAdmin, createProject)
router.put('/:id', authenticateToken, requireAdmin, updateProject)
router.delete('/:id', authenticateToken, requireAdmin, deleteProject)

export default router
