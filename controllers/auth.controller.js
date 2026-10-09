import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/index.js'
import { validateRealEmail } from '../utils/emailValidator.js'
import { sendOtpEmail } from '../utils/emailService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_orogen_jwt_key_2026'

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// Helper to validate strong password complexity
const validatePasswordComplexity = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least 1 lowercase letter.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter.'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least 1 numerical value.'
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Password must contain at least 1 special character (e.g. !@#$%^&*).'
  }
  return null
}

// Sign Up new user (Enforces real email validation + Strong Password + OTP sent via email)
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' })
    }

    const passwordError = validatePasswordComplexity(password)
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const emailValidation = await validateRealEmail(normalizedEmail)
    if (!emailValidation.valid) {
      return res.status(400).json({ success: false, message: emailValidation.reason })
    }

    const existingUser = await query('SELECT id, name, is_verified FROM users WHERE email = $1', [normalizedEmail])
    if (existingUser.rows.length > 0) {
      const userObj = existingUser.rows[0]
      if (!userObj.is_verified) {
        const otpCode = generateOtp()
        await query(
          `UPDATE users SET otp_code = $1, otp_expires_at = NOW() + INTERVAL '10 minutes' WHERE email = $2`,
          [otpCode, normalizedEmail]
        )
        
        const emailRes = await sendOtpEmail(normalizedEmail, otpCode, userObj.name)
        const msgSuffix = emailRes.sent
          ? 'A 6-digit OTP code has been sent to your email address.'
          : `An OTP was generated. (Note: Email delivery failed: SMTP Bad Credentials. Your verification OTP is: ${otpCode})`

        return res.status(200).json({
          success: true,
          requiresVerification: true,
          email: normalizedEmail,
          message: `An unverified account already exists with this email. ${msgSuffix}`,
        })
      }
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const otpCode = generateOtp()

    // Default public signup values
    const userRole = 'internal_user'
    const userType = 'employee'

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, user_type, is_verified, otp_code, otp_expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '10 minutes') 
       RETURNING id, name, email, role, user_type, is_verified, created_at`,
      [name.trim(), normalizedEmail, passwordHash, userRole, userType, false, otpCode]
    )

    const newUser = result.rows[0]

    // Auto-assign to 'Internal Workforce' group if available
    const gRes = await query("SELECT id FROM groups WHERE name = 'Internal Workforce'")
    if (gRes.rows.length > 0) {
      await query(`INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
        newUser.id,
        gRes.rows[0].id,
      ])
    }

    const emailRes = await sendOtpEmail(normalizedEmail, otpCode, newUser.name)
    const msgSuffix = emailRes.sent
      ? `We have sent a 6-digit OTP verification code to ${normalizedEmail}. Please check your inbox.`
      : `Account created! (Note: SMTP delivery failed due to bad credentials. Your OTP verification code is: ${otpCode})`

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: normalizedEmail,
      message: msgSuffix,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ success: false, message: 'Server error during signup. Please try again.' })
  }
}

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const user = result.rows[0]

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please sign in.' })
    }

    if (user.otp_code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' })
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please click "Resend OTP".' })
    }

    await query(`UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE id = $1`, [user.id])

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        contact_sub_type: user.contact_sub_type,
        account_id: user.account_id,
        project_id: user.project_id,
        is_verified: true,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.' })
  }
}

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const result = await query('SELECT id, name, is_verified FROM users WHERE email = $1', [normalizedEmail])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const userObj = result.rows[0]

    if (userObj.is_verified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' })
    }

    const newOtp = generateOtp()
    await query(
      `UPDATE users SET otp_code = $1, otp_expires_at = NOW() + INTERVAL '10 minutes' WHERE email = $2`,
      [newOtp, normalizedEmail]
    )

    const emailRes = await sendOtpEmail(normalizedEmail, newOtp, userObj.name)
    const msg = emailRes.sent
      ? `A new 6-digit OTP code has been sent to ${normalizedEmail}.`
      : `New OTP generated! (Note: SMTP delivery failed due to bad credentials. Your verification OTP code is: ${newOtp})`

    return res.status(200).json({ success: true, message: msg })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return res.status(500).json({ success: false, message: 'Failed to resend OTP code.' })
  }
}

// Log In existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }

    if (!user.is_verified) {
      const otpCode = generateOtp()
      await query(
        `UPDATE users SET otp_code = $1, otp_expires_at = NOW() + INTERVAL '10 minutes' WHERE id = $2`,
        [otpCode, user.id]
      )
      
      const emailRes = await sendOtpEmail(normalizedEmail, otpCode, user.name)
      const msg = emailRes.sent
        ? 'Your account is not verified yet. We have sent a 6-digit OTP to your email address.'
        : `Your account is not verified yet. (Note: SMTP delivery failed due to bad credentials. Your OTP verification code is: ${otpCode})`

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: normalizedEmail,
        message: msg,
      })
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        contact_sub_type: user.contact_sub_type,
        account_id: user.account_id,
        project_id: user.project_id,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: 'Server error during login. Please try again.' })
  }
}

// Get current user profile with full RBAC, Account, Project details
export const getMe = async (req, res) => {
  try {
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.role, u.user_type, u.contact_sub_type, 
              u.account_id, a.name AS account_name,
              u.project_id, p.name AS project_name,
              u.is_verified, u.created_at
       FROM users u
       LEFT JOIN accounts a ON a.id = u.account_id
       LEFT JOIN projects p ON p.id = u.project_id
       WHERE u.id = $1`,
      [req.user.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const user = userResult.rows[0]

    // Fetch assigned groups
    const groupsRes = await query(
      `SELECT g.id, g.name FROM groups g JOIN user_groups ug ON ug.group_id = g.id WHERE ug.user_id = $1`,
      [req.user.id]
    )

    // Fetch all effective roles (direct + inherited from assigned groups)
    const rolesRes = await query(
      `SELECT DISTINCT r.name 
       FROM roles r
       JOIN group_roles gr ON gr.role_id = r.id
       JOIN user_groups ug ON ug.group_id = gr.group_id
       WHERE ug.user_id = $1`,
      [req.user.id]
    )

    const effectiveRolesSet = new Set(rolesRes.rows.map((r) => r.name))
    if (user.role) effectiveRolesSet.add(user.role)

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        groups: groupsRes.rows,
        effectiveRoles: Array.from(effectiveRolesSet),
      },
    })
  } catch (error) {
    console.error('GetMe error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile.' })
  }
}

// Admin: Get all users with complete Classification, Account, Project, and Group mappings
export const getAllUsers = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.user_type, 
        u.contact_sub_type, 
        u.account_id, 
        a.name AS account_name,
        u.project_id, 
        p.name AS project_name,
        u.is_verified, 
        u.created_at,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT g.name), NULL) AS group_names,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT g.id), NULL) AS group_ids
      FROM users u
      LEFT JOIN accounts a ON a.id = u.account_id
      LEFT JOIN projects p ON p.id = u.project_id
      LEFT JOIN user_groups ug ON ug.user_id = u.id
      LEFT JOIN groups g ON g.id = ug.group_id
      GROUP BY u.id, a.name, p.name
      ORDER BY u.created_at DESC
    `)
    return res.status(200).json({ success: true, users: result.rows })
  } catch (error) {
    console.error('GetAllUsers error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch user directory.' })
  }
}

// Admin: Create User (Enforces Employee vs Contact rules & Group assignment)
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, user_type, contact_sub_type, account_id, project_id, is_verified, group_ids } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' })
    }

    const passwordError = validatePasswordComplexity(password)
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const emailValidation = await validateRealEmail(normalizedEmail)
    if (!emailValidation.valid) {
      return res.status(400).json({ success: false, message: emailValidation.reason })
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' })
    }

    // Validate User Type & Sub-type logic
    const selectedType = ['employee', 'contact'].includes(user_type) ? user_type : 'employee'
    let selectedSubType = null
    let selectedAccountId = null
    let selectedProjectId = null

    if (selectedType === 'contact') {
      const validSubTypes = ['prospect', 'lead', 'customer', 'churned']
      selectedSubType = validSubTypes.includes(contact_sub_type) ? contact_sub_type : 'lead'
      selectedAccountId = account_id ? Number(account_id) : null
    } else {
      // Employee
      selectedProjectId = project_id ? Number(project_id) : null
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const validRoles = ['admin', 'superadmin', 'customer', 'internal_user', 'external_user']
    const userRole = validRoles.includes(role) ? role : (selectedType === 'contact' ? 'customer' : 'internal_user')
    const isVerified = is_verified !== undefined ? Boolean(is_verified) : true

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, user_type, contact_sub_type, account_id, project_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, email, role, user_type, contact_sub_type, account_id, project_id, is_verified, created_at`,
      [name.trim(), normalizedEmail, passwordHash, userRole, selectedType, selectedSubType, selectedAccountId, selectedProjectId, isVerified]
    )

    const newUser = result.rows[0]

    // Assign Groups
    if (Array.isArray(group_ids)) {
      for (const gId of group_ids) {
        await query(`INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
          newUser.id,
          Number(gId),
        ])
      }
    }

    return res.status(201).json({
      success: true,
      message: `User account '${newUser.name}' created successfully.`,
      user: newUser,
    })
  } catch (error) {
    console.error('CreateUserByAdmin error:', error)
    return res.status(500).json({ success: false, message: 'Failed to create user account.' })
  }
}

// Admin: Update User details & Group assignments
export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    const { name, email, role, user_type, contact_sub_type, account_id, project_id, is_verified, password, group_ids } = req.body

    const checkResult = await query('SELECT * FROM users WHERE id = $1', [userId])
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' })
    }

    const targetUser = checkResult.rows[0]

    if (targetUser.email.toLowerCase() === 'harshty261@gmail.com' || targetUser.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Action forbidden. The Super Admin account details cannot be modified.',
      })
    }

    const updatedName = name ? name.trim() : targetUser.name
    const updatedEmail = email ? email.toLowerCase().trim() : targetUser.email
    const validRoles = ['admin', 'superadmin', 'customer', 'internal_user', 'external_user']
    const updatedRole = validRoles.includes(role) ? role : targetUser.role
    const updatedIsVerified = is_verified !== undefined ? Boolean(is_verified) : targetUser.is_verified

    const updatedType = ['employee', 'contact'].includes(user_type) ? user_type : targetUser.user_type
    let updatedSubType = null
    let updatedAccountId = null
    let updatedProjectId = null

    if (updatedType === 'contact') {
      const validSubTypes = ['prospect', 'lead', 'customer', 'churned']
      updatedSubType = validSubTypes.includes(contact_sub_type) ? contact_sub_type : 'lead'
      updatedAccountId = account_id !== undefined ? (account_id ? Number(account_id) : null) : targetUser.account_id
    } else {
      updatedProjectId = project_id !== undefined ? (project_id ? Number(project_id) : null) : targetUser.project_id
    }

    let passwordHash = targetUser.password_hash
    if (password && password.trim().length > 0) {
      const passwordError = validatePasswordComplexity(password.trim())
      if (passwordError) {
        return res.status(400).json({ success: false, message: passwordError })
      }
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const result = await query(
      `UPDATE users 
       SET name = $1, email = $2, role = $3, user_type = $4, contact_sub_type = $5, account_id = $6, project_id = $7, is_verified = $8, password_hash = $9 
       WHERE id = $10 
       RETURNING id, name, email, role, user_type, contact_sub_type, account_id, project_id, is_verified, created_at`,
      [updatedName, updatedEmail, updatedRole, updatedType, updatedSubType, updatedAccountId, updatedProjectId, updatedIsVerified, passwordHash, userId]
    )

    // Update Group Assignments
    if (Array.isArray(group_ids)) {
      await query(`DELETE FROM user_groups WHERE user_id = $1`, [userId])
      for (const gId of group_ids) {
        await query(`INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
          userId,
          Number(gId),
        ])
      }
    }

    return res.status(200).json({
      success: true,
      message: `User account updated successfully.`,
      user: result.rows[0],
    })
  } catch (error) {
    console.error('UpdateUserByAdmin error:', error)
    return res.status(500).json({ success: false, message: 'Failed to update user account.' })
  }
}

// Admin: Update user role directly
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    const validRoles = ['admin', 'superadmin', 'customer', 'internal_user', 'external_user']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
    }

    const targetUserCheck = await query('SELECT id, email, role FROM users WHERE id = $1', [userId])
    if (targetUserCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    const targetUser = targetUserCheck.rows[0]

    if (targetUser.email.toLowerCase() === 'harshty261@gmail.com' || targetUser.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Action forbidden. harshty261@gmail.com is the Super Admin and cannot be demoted or modified.',
      })
    }

    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role', [role, userId])

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: result.rows[0],
    })
  } catch (error) {
    console.error('UpdateUserRole error:', error)
    return res.status(500).json({ success: false, message: 'Failed to update user role.' })
  }
}

// Admin / Super Admin: Delete user from system (Delete CRUD)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    const targetUserCheck = await query('SELECT id, email, role, name FROM users WHERE id = $1', [userId])
    if (targetUserCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' })
    }

    const targetUser = targetUserCheck.rows[0]

    if (targetUser.email.toLowerCase() === 'harshty261@gmail.com' || targetUser.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Action forbidden. The Super Admin account cannot be deleted.',
      })
    }

    await query('DELETE FROM users WHERE id = $1', [userId])

    return res.status(200).json({
      success: true,
      message: `User '${targetUser.name}' (${targetUser.email}) was deleted successfully.`,
    })
  } catch (error) {
    console.error('DeleteUser error:', error)
    return res.status(500).json({ success: false, message: 'Failed to delete user account.' })
  }
}

// Admin Dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsersResult = await query('SELECT COUNT(*) FROM users')
    const adminCountResult = await query("SELECT COUNT(*) FROM users WHERE role IN ('admin', 'superadmin')")
    const employeeCountResult = await query("SELECT COUNT(*) FROM users WHERE user_type = 'employee'")
    const contactCountResult = await query("SELECT COUNT(*) FROM users WHERE user_type = 'contact'")
    const accountsCountResult = await query('SELECT COUNT(*) FROM accounts')
    const projectsCountResult = await query('SELECT COUNT(*) FROM projects')
    const groupsCountResult = await query('SELECT COUNT(*) FROM groups')

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(totalUsersResult.rows[0].count, 10),
        adminUsers: parseInt(adminCountResult.rows[0].count, 10),
        employees: parseInt(employeeCountResult.rows[0].count, 10),
        contacts: parseInt(contactCountResult.rows[0].count, 10),
        accounts: parseInt(accountsCountResult.rows[0].count, 10),
        projects: parseInt(projectsCountResult.rows[0].count, 10),
        groups: parseInt(groupsCountResult.rows[0].count, 10),
      },
    })
  } catch (error) {
    console.error('GetAdminStats error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' })
  }
}
