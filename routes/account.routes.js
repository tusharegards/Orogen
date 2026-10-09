import express from 'express'
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', authenticateToken, getAccounts)
router.get('/:id', authenticateToken, getAccountById)
router.post('/', authenticateToken, requireAdmin, createAccount)
router.put('/:id', authenticateToken, requireAdmin, updateAccount)
router.delete('/:id', authenticateToken, requireAdmin, deleteAccount)

export default router
