import { query } from '../db/index.js'

// GET /api/projects - List all projects with account details and assigned employee count
export const getProjects = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.account_id, 
        a.name AS account_name,
        p.status, 
        p.created_at, 
        p.updated_at,
        COUNT(DISTINCT u.id)::int AS assigned_employee_count
      FROM projects p
      LEFT JOIN accounts a ON a.id = p.account_id
      LEFT JOIN users u ON u.project_id = p.id AND u.user_type = 'employee'
      GROUP BY p.id, a.name
      ORDER BY p.created_at DESC
    `)
    return res.status(200).json({ success: true, projects: result.rows })
  } catch (err) {
    console.error('getProjects error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch projects list.' })
  }
}

// GET /api/projects/:id - Get single project with account info & assigned employees
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    const projResult = await query(`
      SELECT p.*, a.name AS account_name 
      FROM projects p 
      LEFT JOIN accounts a ON a.id = p.account_id 
      WHERE p.id = $1
    `, [id])

    if (projResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    const project = projResult.rows[0]

    // Fetch employee users assigned directly to this project
    const employeesResult = await query(
      `SELECT id, name, email, role, is_verified, created_at FROM users WHERE project_id = $1 AND user_type = 'employee' ORDER BY name ASC`,
      [id]
    )

    return res.status(200).json({
      success: true,
      project,
      assignedEmployees: employeesResult.rows,
    })
  } catch (err) {
    console.error('getProjectById error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch project details.' })
  }
}

// POST /api/projects - Create new project
export const createProject = async (req, res) => {
  try {
    const { name, description, account_id, status } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required.' })
    }

    const parsedAccountId = account_id ? Number(account_id) : null

    const result = await query(
      `INSERT INTO projects (name, description, account_id, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), description ? description.trim() : '', parsedAccountId, status || 'active']
    )

    return res.status(201).json({
      success: true,
      message: `Project '${result.rows[0].name}' created successfully.`,
      project: result.rows[0],
    })
  } catch (err) {
    console.error('createProject error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create project.' })
  }
}

// PUT /api/projects/:id - Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, account_id, status } = req.body

    const check = await query(`SELECT * FROM projects WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    const updatedName = name ? name.trim() : check.rows[0].name
    const updatedDesc = description !== undefined ? description.trim() : check.rows[0].description
    const updatedAccountId = account_id !== undefined ? (account_id ? Number(account_id) : null) : check.rows[0].account_id
    const updatedStatus = status || check.rows[0].status

    const result = await query(
      `UPDATE projects SET name = $1, description = $2, account_id = $3, status = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [updatedName, updatedDesc, updatedAccountId, updatedStatus, id]
    )

    return res.status(200).json({
      success: true,
      message: `Project '${result.rows[0].name}' updated successfully.`,
      project: result.rows[0],
    })
  } catch (err) {
    console.error('updateProject error:', err)
    return res.status(500).json({ success: false, message: 'Failed to update project.' })
  }
}

// DELETE /api/projects/:id - Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params

    const check = await query(`SELECT * FROM projects WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' })
    }

    await query(`DELETE FROM projects WHERE id = $1`, [id])

    return res.status(200).json({
      success: true,
      message: `Project '${check.rows[0].name}' deleted successfully.`,
    })
  } catch (err) {
    console.error('deleteProject error:', err)
    return res.status(500).json({ success: false, message: 'Failed to delete project.' })
  }
}
