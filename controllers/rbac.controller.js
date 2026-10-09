import { query } from '../db/index.js'

// GET /api/rbac/roles - List all 5 system roles
export const getRoles = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM roles ORDER BY id ASC`)
    return res.status(200).json({ success: true, roles: result.rows })
  } catch (err) {
    console.error('getRoles error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch system roles.' })
  }
}

// GET /api/rbac/groups - List all groups with assigned roles and member counts
export const getGroups = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        g.id, 
        g.name, 
        g.description, 
        g.created_at,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT r.name), NULL) AS assigned_roles,
        COUNT(DISTINCT ug.user_id)::int AS member_count
      FROM groups g
      LEFT JOIN group_roles gr ON gr.group_id = g.id
      LEFT JOIN roles r ON r.id = gr.role_id
      LEFT JOIN user_groups ug ON ug.group_id = g.id
      GROUP BY g.id
      ORDER BY g.id ASC
    `)
    return res.status(200).json({ success: true, groups: result.rows })
  } catch (err) {
    console.error('getGroups error:', err)
    return res.status(500).json({ success: false, message: 'Failed to fetch groups list.' })
  }
}

// POST /api/rbac/groups - Create a new Group & assign Roles
export const createGroup = async (req, res) => {
  try {
    const { name, description, role_ids } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required.' })
    }

    const check = await query(`SELECT id FROM groups WHERE name = $1`, [name.trim()])
    if (check.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A group with this name already exists.' })
    }

    const gRes = await query(
      `INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *`,
      [name.trim(), description ? description.trim() : '']
    )

    const group = gRes.rows[0]

    // Assign Roles to Group if provided
    if (Array.isArray(role_ids)) {
      for (const rId of role_ids) {
        await query(
          `INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [group.id, Number(rId)]
        )
      }
    }

    return res.status(201).json({
      success: true,
      message: `Group '${group.name}' created successfully.`,
      group,
    })
  } catch (err) {
    console.error('createGroup error:', err)
    return res.status(500).json({ success: false, message: 'Failed to create group.' })
  }
}

// PUT /api/rbac/groups/:id - Update Group name, description, and assigned roles
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, role_ids } = req.body

    const check = await query(`SELECT * FROM groups WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found.' })
    }

    const updatedName = name ? name.trim() : check.rows[0].name
    const updatedDesc = description !== undefined ? description.trim() : check.rows[0].description

    await query(`UPDATE groups SET name = $1, description = $2 WHERE id = $3`, [updatedName, updatedDesc, id])

    // Update Role Mappings for Group
    if (Array.isArray(role_ids)) {
      await query(`DELETE FROM group_roles WHERE group_id = $1`, [id])
      for (const rId of role_ids) {
        await query(
          `INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, Number(rId)]
        )
      }
    }

    return res.status(200).json({
      success: true,
      message: `Group '${updatedName}' updated successfully.`,
    })
  } catch (err) {
    console.error('updateGroup error:', err)
    return res.status(500).json({ success: false, message: 'Failed to update group.' })
  }
}

// DELETE /api/rbac/groups/:id - Delete a Group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params

    const check = await query(`SELECT * FROM groups WHERE id = $1`, [id])
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found.' })
    }

    // Protect Super Administrators group
    if (check.rows[0].name === 'Super Administrators') {
      return res.status(403).json({ success: false, message: 'The Super Administrators group cannot be deleted.' })
    }

    await query(`DELETE FROM groups WHERE id = $1`, [id])

    return res.status(200).json({
      success: true,
      message: `Group '${check.rows[0].name}' deleted successfully.`,
    })
  } catch (err) {
    console.error('deleteGroup error:', err)
    return res.status(500).json({ success: false, message: 'Failed to delete group.' })
  }
}
