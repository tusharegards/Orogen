import express from 'express'
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  updateUserRole,
  deleteUser,
  getAdminStats,
} from '../controllers/auth.controller.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public authentication routes
router.post('/signup', signup)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.post('/login', login)

// Authenticated user route
router.get('/me', authenticateToken, getMe)

// Protected Admin CRUD routes
router.get('/admin/stats', authenticateToken, requireAdmin, getAdminStats)
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers)
router.post('/admin/users', authenticateToken, requireAdmin, createUserByAdmin)
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUserByAdmin)
router.patch('/admin/users/:userId/role', authenticateToken, requireAdmin, updateUserRole)
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser)

export default router
