import { query } from '../db/index.js'

// GET /api/accounts - List all accounts with project counts and contact counts
export const getAccounts = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        a.id, 
        a.name, 
        a.industry, 
        a.status, 
        a.created_at, 
        a.updated_at,
        COUNT(DISTINCT p.id)::int AS project_count,
        COUNT(DISTINCT u.id)::int AS contact_count
      FROM accounts a
      LEFT JOIN projects p ON p.account_id = a.id
      LEFT JOIN users u ON u.account_id = a.id AND u.user_type = 'contact'
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `)
    return res.status(200).json({ success: true, accounts: result.rows })
  } catch (err) {
    console.error('getAccounts error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch accounts list.' })
  }
}

// GET /api/accounts/:id - Get single account with linked projects and contacts
export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params
    const accResult = await query(`SELECT * FROM accounts WHERE id = $1`, [id])

    if (accResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const account = accResult.rows[0]

    // Fetch projects belonging to this account
    const projectsResult = await query(`SELECT * FROM projects WHERE account_id = $1 ORDER BY created_at DESC`, [id])

    // Fetch contact users linked to this account
    const contactsResult = await query(
      `SELECT id, name, email, role, contact_sub_type, is_verified, created_at FROM users WHERE account_id = $1 AND user_type = 'contact' ORDER BY created_at DESC`,
      [id]
    )

    return res.status(200).json({
      success: true,
      account,
      projects: projectsResult.rows,
      contacts: contactsResult.rows,
    })
  } catch (err) {
    console.error('getAccountById error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch account details.' })
  }
}

// POST /api/accounts - Create new account
export const createAccount = async (req, res) => {
  try {
    const { name, industry, status } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Account name is required.' })
    }

    const result = await query(
      `INSERT INTO accounts (name, industry, status) VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), industry ? industry.trim() : 'General', status || 'active']
    )

    return res.status(201).json({
      success: true,
      message: `Account '${result.rows[0].name}' created successfully.`,
      account: result.rows[0],
    })
  } catch (err) {
    console.error('createAccount error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create account.' })
  }
}

// PUT /api/accounts/:id - Update account
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params
    const { name, industry, status } = req.body

    const check = await query(`SELECT * FROM accounts WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const updatedName = name ? name.trim() : check.rows[0].name
    const updatedIndustry = industry !== undefined ? industry.trim() : check.rows[0].industry
    const updatedStatus = status || check.rows[0].status

    const result = await query(
      `UPDATE accounts SET name = $1, industry = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [updatedName, updatedIndustry, updatedStatus, id]
    )

    return res.status(200).json({
      success: true,
      message: `Account '${result.rows[0].name}' updated successfully.`,
      account: result.rows[0],
    })
  } catch (err) {
    console.error('updateAccount error:', err)
    return res.status(500).json({ success: false, message: 'Failed to update account.' })
  }
}

// DELETE /api/accounts/:id - Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params

    const check = await query(`SELECT * FROM accounts WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    await query(`DELETE FROM accounts WHERE id = $1`, [id])

    return res.status(200).json({
      success: true,
      message: `Account '${check.rows[0].name}' deleted successfully.`,
    })
  } catch (err) {
    console.error('deleteAccount error:', err)
    return res.status(500).json({ success: false, message: 'Failed to delete account.' })
  }
}
