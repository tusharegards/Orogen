import express from 'express'
import {
  getRoles,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/rbac.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/roles', authenticateToken, getRoles)
router.get('/groups', authenticateToken, getGroups)
router.post('/groups', authenticateToken, requireAdmin, createGroup)
router.put('/groups/:id', authenticateToken, requireAdmin, updateGroup)
router.delete('/groups/:id', authenticateToken, requireAdmin, deleteGroup)

export default router
