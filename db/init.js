import bcrypt from 'bcryptjs'
import { pool } from './index.js'

export const initDb = async () => {
  try {
    const client = await pool.connect()

    // 1. Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 2. Create projects table (Account points to Projects / Project belongs to Account)
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 3. Create roles table (admin, superadmin, customer, internal_user, external_user)
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 4. Create groups table (AWS / ServiceNow group-based access control)
    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 5. Create group_roles junction table (Roles belong to Groups)
    await client.query(`
      CREATE TABLE IF NOT EXISTS group_roles (
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, role_id)
      );
    `)

    // 6. Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'internal_user',
        user_type VARCHAR(50) DEFAULT 'employee',
        contact_sub_type VARCHAR(50) NULL,
        account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        is_verified BOOLEAN DEFAULT false,
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Add columns if migrating from existing table structure
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'employee';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_sub_type VARCHAR(50) NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
    `)

    // 7. Create user_groups junction table (Individual Users belong to Groups)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_groups (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, group_id)
      );
    `)

    console.log('✅ Base Database Schema & RBAC Tables ready in PostgreSQL.')

    // =========================================================
    // SEED SYSTEM ROLES & GROUPS
    // Required Roles: admin, superadmin, customer, internal_user, external_user
    // =========================================================
    const systemRoles = [
      { name: 'superadmin', description: 'Full system administration & security privilege' },
      { name: 'admin', description: 'Administrative access for operations and management' },
      { name: 'customer', description: 'Access for customer portal contacts' },
      { name: 'internal_user', description: 'Access for internal employee workforce' },
      { name: 'external_user', description: 'Access for external contractors & partners' },
    ]

    for (const r of systemRoles) {
      await client.query(
        `INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
        [r.name, r.description]
      )
    }

    // Seed Standard System Groups
    const systemGroups = [
      { name: 'Super Administrators', description: 'Global Super Admin group with all privileges' },
      { name: 'System Administrators', description: 'Administrative staff group for workspace operations' },
      { name: 'Internal Workforce', description: 'Internal employee staff members' },
      { name: 'Customer Contacts', description: 'Client account contact users' },
      { name: 'External Partners', description: 'External vendor and partner users' },
    ]

    for (const g of systemGroups) {
      await client.query(
        `INSERT INTO groups (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
        [g.name, g.description]
      )
    }

    // Map Roles to Groups in group_roles
    // 1. Super Administrators group -> superadmin, admin
    // 2. System Administrators group -> admin
    // 3. Internal Workforce group -> internal_user
    // 4. Customer Contacts group -> customer
    // 5. External Partners group -> external_user
    const groupRoleMappings = [
      { group: 'Super Administrators', roles: ['superadmin', 'admin'] },
      { group: 'System Administrators', roles: ['admin'] },
      { group: 'Internal Workforce', roles: ['internal_user'] },
      { group: 'Customer Contacts', roles: ['customer'] },
      { group: 'External Partners', roles: ['external_user'] },
    ]

    for (const mapping of groupRoleMappings) {
      const gRes = await client.query('SELECT id FROM groups WHERE name = $1', [mapping.group])
      if (gRes.rows.length > 0) {
        const groupId = gRes.rows[0].id
        for (const roleName of mapping.roles) {
          const rRes = await client.query('SELECT id FROM roles WHERE name = $1', [roleName])
          if (rRes.rows.length > 0) {
            const roleId = rRes.rows[0].id
            await client.query(
              `INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [groupId, roleId]
            )
          }
        }
      }
    }

    // =========================================================
    // SEED SAMPLE ACCOUNTS & PROJECTS
    // =========================================================
    const sampleAccounts = [
      { name: 'Acme Global Enterprises', industry: 'Technology', status: 'active' },
      { name: 'Apex Logistics & Energy', industry: 'Logistics', status: 'active' },
      { name: 'Nexus Financial Solutions', industry: 'Finance', status: 'active' },
    ]

    for (const acc of sampleAccounts) {
      const checkAcc = await client.query('SELECT id FROM accounts WHERE name = $1', [acc.name])
      if (checkAcc.rows.length === 0) {
        await client.query('INSERT INTO accounts (name, industry, status) VALUES ($1, $2, $3)', [
          acc.name,
          acc.industry,
          acc.status,
        ])
      }
    }

    // Fetch account IDs for project linkage
    const acmeAcc = await client.query("SELECT id FROM accounts WHERE name = 'Acme Global Enterprises'")
    const apexAcc = await client.query("SELECT id FROM accounts WHERE name = 'Apex Logistics & Energy'")

    const acmeId = acmeAcc.rows[0]?.id
    const apexId = apexAcc.rows[0]?.id

    const sampleProjects = [
      { name: 'Orogen Cloud Platform Upgrade', description: 'Next-Gen Cloud Infrastructure for Acme Global', account_id: acmeId, status: 'active' },
      { name: 'Supply Chain Automation', description: 'Logistics tracking software for Apex Energy', account_id: apexId, status: 'active' },
      { name: 'Internal Employee Portal', description: 'Internal HR and project management platform', account_id: null, status: 'active' },
    ]

    for (const proj of sampleProjects) {
      const checkProj = await client.query('SELECT id FROM projects WHERE name = $1', [proj.name])
      if (checkProj.rows.length === 0) {
        await client.query('INSERT INTO projects (name, description, account_id, status) VALUES ($1, $2, $3, $4)', [
          proj.name,
          proj.description,
          proj.account_id,
          proj.status,
        ])
      }
    }

    // Fetch sample project IDs
    const cloudProj = await client.query("SELECT id FROM projects WHERE name = 'Orogen Cloud Platform Upgrade'")
    const cloudProjId = cloudProj.rows[0]?.id

    // =========================================================
    // SEED DEFAULT USERS & ASSIGN TO GROUPS
    // =========================================================
    // 1. Super Admin: harshty261@gmail.com / Tushar@123
    const superAdminEmail = 'harshty261@gmail.com'
    const superAdminPasswordHash = await bcrypt.hash('Tushar@123', 10)

    let superAdminUserId
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [superAdminEmail])
    if (adminCheck.rows.length === 0) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, user_type, project_id, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        ['Harsh Tyagi (Super Admin)', superAdminEmail, superAdminPasswordHash, 'superadmin', 'employee', cloudProjId, true]
      )
      superAdminUserId = res.rows[0].id
      console.log(`👑 Seeded Super Admin user: ${superAdminEmail} (Password: Tushar@123)`)
    } else {
      superAdminUserId = adminCheck.rows[0].id
      await client.query(
        `UPDATE users SET password_hash = $1, role = $2, user_type = 'employee', project_id = $3, is_verified = true WHERE email = $4`,
        [superAdminPasswordHash, 'superadmin', cloudProjId, superAdminEmail]
      )
      console.log(`👑 Super Admin user ${superAdminEmail} updated with role='superadmin'.`)
    }

    // Assign Super Admin to 'Super Administrators' group
    const superAdminGroup = await client.query("SELECT id FROM groups WHERE name = 'Super Administrators'")
    if (superAdminGroup.rows.length > 0 && superAdminUserId) {
      await client.query(
        `INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [superAdminUserId, superAdminGroup.rows[0].id]
      )
    }

    // 2. Seed Sample Customer Contact user (Contact type -> Customer sub-type -> points to Acme Account)
    const customerEmail = 'customer@acme.com'
    const customerCheck = await client.query('SELECT id FROM users WHERE email = $1', [customerEmail])
    if (customerCheck.rows.length === 0 && acmeId) {
      const customerPassHash = await bcrypt.hash('Customer@123', 10)
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, user_type, contact_sub_type, account_id, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        ['Sarah Jenkins', customerEmail, customerPassHash, 'customer', 'contact', 'customer', acmeId, true]
      )
      const customerUserId = res.rows[0].id
      const customerGroup = await client.query("SELECT id FROM groups WHERE name = 'Customer Contacts'")
      if (customerGroup.rows.length > 0) {
        await client.query(
          `INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [customerUserId, customerGroup.rows[0].id]
        )
      }
      console.log(`🌱 Seeded Customer Contact: ${customerEmail} (Password: Customer@123)`)
    }

    client.release()
    console.log('✅ Database initialization complete with Groups, Roles, Accounts, Projects, and User Classifications!')
  } catch (err) {
    console.error('⚠️ DB Initialization error:', err)
  }
}
