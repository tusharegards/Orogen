import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_orogen_jwt_key_2026'

// Authenticate JWT Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token missing. Please sign in.' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session. Please sign in again.' })
    }
    req.user = user
    next()
  })
}

// Helper: Fetch all effective roles for a user (Direct role + Group-inherited roles)
export const getUserEffectiveRoles = async (userId, directRole) => {
  const rolesSet = new Set()
  if (directRole) rolesSet.add(directRole)

  try {
    const res = await query(
      `SELECT DISTINCT r.name 
       FROM roles r
       JOIN group_roles gr ON gr.role_id = r.id
       JOIN user_groups ug ON ug.group_id = gr.group_id
       WHERE ug.user_id = $1`,
      [userId]
    )
    for (const row of res.rows) {
      rolesSet.add(row.name)
    }
  } catch (err) {
    console.error('Error fetching effective user roles:', err)
  }

  return Array.from(rolesSet)
}

// Require Admin or Super Admin Role (Direct or Group-Inherited)
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' })
  }

  const effectiveRoles = await getUserEffectiveRoles(req.user.id, req.user.role)
  const hasAdmin = effectiveRoles.some((r) => ['admin', 'superadmin'].includes(r))

  if (!hasAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied. Admin or Super Admin privilege required.' })
  }

  req.user.effectiveRoles = effectiveRoles
  next()
}

// Require Specific Roles middleware
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const effectiveRoles = await getUserEffectiveRoles(req.user.id, req.user.role)
    const hasRole = effectiveRoles.some((r) => allowedRoles.includes(r) || r === 'superadmin')

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
      })
    }

    req.user.effectiveRoles = effectiveRoles
    next()
  }
}
