import React, { useState, useEffect } from 'react'
import { Box, Button, Flex, Grid, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import toast from 'react-hot-toast'
import { dashboardStyles } from '../styles/dashboardStyles'

const MOCK_PROJECTS = [
  { _id: 'proj_alpha', name: 'Summit Lab AI', is_active: true, pay_rate: 50, currency: 'USD' },
  { _id: 'proj_beta', name: 'Orogen Core', is_active: true, pay_rate: 35, currency: 'USD' },
  { _id: 'proj_gamma', name: 'Mountain Cold Fire', is_active: true, pay_rate: 2500, currency: 'INR' }
]

const INITIAL_LOGS = [
  {
    _id: 'log_seed_1',
    user_id: 'mock_employee',
    employee_email: 'employee@orogen.com',
    project_id: 'proj_alpha',
    project_name: 'Summit Lab AI',
    hours_logged: 8,
    log_date: '2026-06-15',
    description: 'Worked on implementing fine-tuning pipelines and evaluating performance metrics.',
    status: 'approved',
    pay_rate: 50,
    currency: 'USD'
  },
  {
    _id: 'log_seed_2',
    user_id: 'mock_employee',
    employee_email: 'employee@orogen.com',
    project_id: 'proj_beta',
    project_name: 'Orogen Core',
    hours_logged: 6.5,
    log_date: '2026-06-16',
    description: 'Refactored Express router setup and fixed memory leak in connection listener.',
    status: 'pending',
    pay_rate: 35,
    currency: 'USD'
  }
]

// Helper components declared outside Dashboard to prevent focus loss during renders
const ProjectRateConfigRow = ({ project, onSave }) => {
  const [rate, setRate] = useState(project.pay_rate || 0)
  const [currency, setCurrency] = useState(project.currency || 'USD')
  const [updating, setUpdating] = useState(false)

  const handleSave = async () => {
    setUpdating(true)
    await onSave(project._id || project.id, rate, currency)
    setUpdating(false)
  }

  return (
    <Box as="tr" {...dashboardStyles.tr}>
      <Box as="td" {...dashboardStyles.td} fontWeight="600">{project.name}</Box>
      <Box as="td" {...dashboardStyles.td}>
        <Box
          as="input"
          type="number"
          min="0"
          step="0.5"
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
          {...dashboardStyles.input}
          style={{ ...dashboardStyles.input, height: '2rem', width: '90px', padding: '0 0.5rem', background: 'rgba(0,0,0,0.4)' }}
        />
      </Box>
      <Box as="td" {...dashboardStyles.td}>
        <Box
          as="select"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          {...dashboardStyles.input}
          style={{ ...dashboardStyles.input, height: '2rem', width: '80px', padding: '0 0.5rem', background: 'rgba(0,0,0,0.4)', colorScheme: 'dark' }}
        >
          <option value="USD" style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-main)' }}>USD ($)</option>
          <option value="INR" style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-main)' }}>INR (₹)</option>
        </Box>
      </Box>
      <Box as="td" {...dashboardStyles.td} textAlign="right">
        <Button
          size="xs"
          onClick={handleSave}
          disabled={updating}
          {...dashboardStyles.submitBtn}
          style={{ ...dashboardStyles.submitBtn, height: '2rem', width: 'auto', padding: '0 0.75rem' }}
        >
          {updating ? 'Saving' : 'Save'}
        </Button>
      </Box>
    </Box>
  )
}

const CollapsibleText = ({ text, maxLength = 60 }) => {
  const [expanded, setExpanded] = useState(false)
  if (!text) return <Text as="span" fontSize="xs" color="var(--text-muted)">-</Text>
  if (text.length <= maxLength) return <Text as="span" fontSize="xs">{text}</Text>

  return (
    <Box fontSize="xs">
      <Text as="span">
        {expanded ? text : `${text.slice(0, maxLength)}...`}
      </Text>
      <Button
        variant="link"
        size="xs"
        onClick={() => setExpanded(!expanded)}
        color="var(--accent)"
        display="inline-flex"
        ml="1.5"
        height="auto"
        padding="0"
        style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
      >
        {expanded ? 'Less' : 'More'}
      </Button>
    </Box>
  )
}

const LogPaymentCell = ({ log, onPay, formatEarnings }) => {
  const [payAmount, setPayAmount] = useState('')
  const [paying, setPaying] = useState(false)

  const earnings = log.hours_logged * (log.pay_rate || 0)
  const paid = log.amount_paid || 0
  const remaining = earnings - paid

  if (log.status !== 'approved') return <Text as="span" fontSize="xs" color="var(--text-muted)">-</Text>
  if (remaining <= 0) return <Text as="span" fontSize="xs" color="#48bb78" fontWeight="700">Fully Paid</Text>

  const handlePay = async () => {
    const amt = parseFloat(payAmount)
    if (isNaN(amt) || amt <= 0 || amt > remaining) {
      toast.error(`Enter a valid amount between 0 and ${remaining.toFixed(2)}`)
      return
    }
    setPaying(true)
    await onPay(log._id, amt)
    setPaying(false)
    setPayAmount('')
  }

  return (
    <Flex gap="1.5" align="center" justify="flex-end">
      <Box
        as="input"
        type="number"
        min="0"
        max={remaining}
        step="0.5"
        placeholder={`Rem: ${remaining.toFixed(1)}`}
        value={payAmount}
        onChange={(e) => setPayAmount(e.target.value)}
        {...dashboardStyles.input}
        style={{ ...dashboardStyles.input, height: '1.8rem', width: '80px', fontSize: '11px', padding: '0 0.4rem', background: 'rgba(0,0,0,0.4)', alignSelf: 'center' }}
      />
      <Button
        size="xs"
        onClick={handlePay}
        disabled={paying}
        {...dashboardStyles.submitBtn}
        style={{ ...dashboardStyles.submitBtn, height: '1.8rem', width: 'auto', padding: '0 0.5rem', fontSize: '11px', alignSelf: 'center' }}
      >
        Pay
      </Button>
    </Flex>
  )
}

const Dashboard = () => {
  // Database configuration status detected from backend
  const [dbConfigured, setDbConfigured] = useState(false)

  // Session State (persisted locally)
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('userSession')
    return saved ? JSON.parse(saved) : null
  })

  // Master Logs State (database records or mock dataset)
  const [masterLogs, setMasterLogs] = useState(() => {
    const saved = localStorage.getItem('masterLogs')
    return saved ? JSON.parse(saved) : INITIAL_LOGS
  })

  // Projects list
  const [projectsList, setProjectsList] = useState(() => {
    const saved = localStorage.getItem('masterProjects')
    return saved ? JSON.parse(saved) : MOCK_PROJECTS
  })

  // Employee Form State
  const [description, setDescription] = useState('')

  // Login Input State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  // Employee Form State
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [hoursLogged, setHoursLogged] = useState('8')
  const [logDate, setLogDate] = useState('2026-06-14')

  // Admin Search & Filters State
  const [adminSearch, setAdminSearch] = useState('')
  const [adminProjectFilter, setAdminProjectFilter] = useState('all')

  // Admin Project Creation State
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  // Synchronize mock logs to localStorage (Local Mode only)
  useEffect(() => {
    if (!dbConfigured) {
      localStorage.setItem('masterLogs', JSON.stringify(masterLogs))
    }
  }, [masterLogs, dbConfigured])

  // Synchronize session to localStorage (so user stays logged in across reloads)
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('userSession', JSON.stringify(userSession))
    } else {
      localStorage.removeItem('userSession')
    }
  }, [userSession])

  // 1. INITIAL STATUS & CONFIG DETECTION
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('/api/timesheet/status')
        const status = await response.json()
        
        if (status.isConfigured && status.isConnected) {
          setDbConfigured(true)
          fetchProjects(true)
        } else {
          setDbConfigured(false)
          fetchProjects(false)
        }
      } catch (err) {
        console.warn('Backend server unreachable or status endpoint failed. Falling back to local mode.', err)
        setDbConfigured(false)
        fetchProjects(false)
      }
    }

    checkBackendStatus()
  }, [])

  // Fetch Projects List
  const fetchProjects = async (isLive) => {
    if (!isLive) {
      const saved = localStorage.getItem('masterProjects')
      const projects = saved ? JSON.parse(saved) : MOCK_PROJECTS
      setProjectsList(projects)
      if (projects && projects.length > 0) {
        setSelectedProjectId(projects[0]._id || projects[0].id)
      } else {
        setSelectedProjectId('')
      }
      return
    }
    try {
      const response = await fetch('/api/timesheet/projects')
      if (!response.ok) throw new Error('Failed to load projects')
      
      const data = await response.json()
      setProjectsList(data)
      
      if (data && data.length > 0) {
        setSelectedProjectId(data[0]._id || data[0].id)
      } else {
        setSelectedProjectId('')
      }
    } catch (err) {
      console.error('Error loading database projects:', err)
      toast.error('Failed to sync projects from database')
    }
  }

  // 2. TIMEOUT SYNCHRONIZATION (Loads logs on mount/view change)
  useEffect(() => {
    if (!userSession || !dbConfigured) return
    fetchLogsHistory()
  }, [userSession, dbConfigured])

  // Fetch Timesheet Logs history
  const fetchLogsHistory = async () => {
    try {
      const response = await fetch('/api/timesheet/logs', {
        headers: {
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        }
      })

      if (!response.ok) throw new Error('Unauthorised or database error')
      
      const data = await response.json()
      setMasterLogs(data)
    } catch (err) {
      console.error('Error fetching timesheet logs:', err)
      toast.error('Database sync failed')
    }
  }

  // 3. ACTION HANDLERS

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    const email = loginEmail.trim().toLowerCase()
    const password = loginPassword

    if (!dbConfigured) {
      // Offline mock authentication sandbox
      if (email === 'admin@orogen.com' && password === 'admin123') {
        const mockSession = { id: 'mock_admin', email: 'admin@orogen.com', role: 'admin' }
        setUserSession(mockSession)
        toast.success('Offline mode: Logged in as admin')
        setLoginEmail('')
        setLoginPassword('')
      } else if (email === 'employee@orogen.com' && password === 'employee123') {
        const mockSession = { id: 'mock_employee', email: 'employee@orogen.com', role: 'employee' }
        setUserSession(mockSession)
        toast.success('Offline mode: Logged in as employee')
        setLoginEmail('')
        setLoginPassword('')
      } else {
        setLoginError('Invalid credentials for offline mode. Use admin@orogen.com/admin123 or employee@orogen.com/employee123')
        toast.error('Login Failed')
      }
      setLoading(false)
      return
    }

    try {
      // Live MongoDB Auth via Express Backend
      const response = await fetch('/api/timesheet/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      setUserSession(result)
      toast.success(`Welcome back! Logged in as ${result.role}`)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.')
      toast.error('Login Failed')
    } finally {
      setLoading(false)
    }
  }

  // Log Out handler
  const handleLogout = () => {
    setUserSession(null)
    toast.success('Logged out successfully')
  }

  // Timesheet Submit handler
  const handleTimesheetSubmit = async (e) => {
    e.preventDefault()

    if (projectsList.length === 0) {
      toast.error('No projects available to log hours against')
      return
    }

    const hours = parseFloat(hoursLogged)
    if (isNaN(hours) || hours < 0.5 || hours > 24) {
      toast.error('Hours must be between 0.5 and 24')
      return
    }

    if (!logDate) {
      toast.error('Please select a date')
      return
    }

    if (!description.trim()) {
      toast.error('Description is required')
      return
    }

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length
    if (wordCount > 500) {
      toast.error('Description must not exceed 500 words')
      return
    }

    const projectId = selectedProjectId || (projectsList[0]?._id || projectsList[0]?.id)
    const project = projectsList.find(
      (p) => (p._id || p.id) === projectId
    )

    if (!project) {
      toast.error('Invalid project selected')
      return
    }

    if (!dbConfigured) {
      // Local Mock Mode Insert
      const newLog = {
        _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userSession.id,
        employee_email: userSession.email,
        project_id: projectId,
        project_name: project.name,
        pay_rate: project.pay_rate || 0,
        currency: project.currency || 'USD',
        hours_logged: hours,
        log_date: logDate,
        description: description.trim(),
        status: 'pending'
      }

      setMasterLogs((prev) => [newLog, ...prev])
      toast.success(`Logged ${hours} hours for ${project.name} (Pending Approval)`)
      setHoursLogged('8')
      setDescription('')
      return
    }

    try {
      // Live MongoDB Insert via Express Backend
      const response = await fetch('/api/timesheet/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        },
        body: JSON.stringify({
          project_id: projectId,
          hours_logged: hours,
          log_date: logDate,
          description: description.trim()
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed')
      }

      toast.success(`Hours logged successfully for ${project.name} (Pending Approval)`)
      setHoursLogged('8')
      setDescription('')
      // Refresh logs history
      fetchLogsHistory()
    } catch (err) {
      console.error('Submission error:', err)
      toast.error(`Submission failed: ${err.message}`)
    }
  }

  // Create Project handler (Admin Panel)
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault()

    if (!newProjectName.trim()) {
      toast.error('Project name cannot be empty')
      return
    }

    if (!dbConfigured) {
      // Local Mock Project Seeding
      const newId = `proj_${Date.now()}`
      const newProj = { _id: newId, name: newProjectName.trim(), pay_rate: 0, currency: 'USD', is_active: true }
      setProjectsList((prev) => {
        const updated = [...prev, newProj];
        localStorage.setItem('masterProjects', JSON.stringify(updated));
        return updated;
      })
      toast.success(`Project "${newProjectName.trim()}" created successfully (Mock Mode)`)
      setNewProjectName('')
      if (!selectedProjectId) {
        setSelectedProjectId(newId)
      }
      return
    }

    try {
      setIsCreatingProject(true)
      const response = await fetch('/api/timesheet/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        },
        body: JSON.stringify({ name: newProjectName.trim() })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      toast.success(`Project "${result.name}" registered successfully!`)
      setNewProjectName('')
      // Refresh active projects list
      await fetchProjects(true)
    } catch (err) {
      console.error('Failed to create project:', err)
      toast.error(`Creation failed: ${err.message}`)
    } finally {
      setIsCreatingProject(false)
    }
  }

  // Update Project billing configurations (Admin action)
  const handleUpdateProjectRate = async (projectId, rate, currency) => {
    if (!dbConfigured) {
      setProjectsList(prev => {
        const updated = prev.map(p => {
          if ((p._id || p.id) === projectId) {
            return { ...p, pay_rate: rate, currency: currency };
          }
          return p;
        });
        localStorage.setItem('masterProjects', JSON.stringify(updated));
        return updated;
      });
      // Synchronize in mock logs as well to update rate/currency info
      setMasterLogs(prev => {
        const updatedLogs = prev.map(l => {
          if (l.project_id === projectId) {
            return { ...l, pay_rate: rate, currency: currency };
          }
          return l;
        });
        localStorage.setItem('masterLogs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
      toast.success('Project billing configuration updated (Mock Mode)');
      return;
    }

    try {
      const response = await fetch(`/api/timesheet/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        },
        body: JSON.stringify({ pay_rate: rate, currency })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update billing rate')
      }

      toast.success('Project billing configuration updated successfully')
      fetchProjects(true)
      fetchLogsHistory()
    } catch (err) {
      console.error('Failed to update project rate:', err)
      toast.error(`Update failed: ${err.message}`)
    }
  }

  // Update Timesheet Status approval/rejection (Admin action)
  const handleUpdateLogStatus = async (logId, status) => {
    if (!dbConfigured) {
      setMasterLogs(prev => {
        const updated = prev.map(l => {
          if (l._id === logId) {
            return { ...l, status };
          }
          return l;
        });
        localStorage.setItem('masterLogs', JSON.stringify(updated));
        return updated;
      });
      toast.success(`Timesheet entry successfully ${status} (Mock Mode)`);
      return;
    }

    try {
      const response = await fetch(`/api/timesheet/logs/${logId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      toast.success(`Timesheet entry successfully ${status}`)
      fetchLogsHistory()
    } catch (err) {
      console.error('Failed to update log status:', err)
      toast.error(`Operation failed: ${err.message}`)
    }
  }

  // Currency helper formatting
  const formatEarnings = (hours, rate, currency) => {
    const total = hours * rate
    if (currency === 'INR') {
      return `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Status badge styling helper
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      display: 'inline-block',
      px: '2.5',
      py: '0.5',
      borderRadius: 'full',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }
    if (status === 'approved') {
      return {
        ...baseStyle,
        border: '1px solid rgba(72, 187, 120, 0.4)',
        bg: 'rgba(72, 187, 120, 0.08)',
        color: '#48bb78',
      }
    }
    if (status === 'rejected') {
      return {
        ...baseStyle,
        border: '1px solid rgba(245, 101, 101, 0.4)',
        bg: 'rgba(245, 101, 101, 0.08)',
        color: '#f56565',
      }
    }
    return {
      ...baseStyle,
      border: '1px solid rgba(232, 185, 120, 0.4)',
      bg: 'rgba(232, 185, 120, 0.08)',
      color: '#e8b978',
    }
  }

  // Payment badge styling helper
  const getPaymentBadgeStyle = (status) => {
    const baseStyle = {
      display: 'inline-block',
      px: '2',
      py: '0.5',
      borderRadius: 'full',
      fontSize: '10px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }
    if (status === 'paid') {
      return {
        ...baseStyle,
        border: '1px solid rgba(72, 187, 120, 0.4)',
        bg: 'rgba(72, 187, 120, 0.08)',
        color: '#48bb78',
      }
    }
    if (status === 'partially_paid') {
      return {
        ...baseStyle,
        border: '1px solid rgba(236, 201, 75, 0.4)',
        bg: 'rgba(236, 201, 75, 0.08)',
        color: '#ecc94b',
      }
    }
    return {
      ...baseStyle,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      bg: 'rgba(255, 255, 255, 0.04)',
      color: 'var(--text-muted)',
    }
  }

  // Record payment amount (Admin action)
  const handleLogPayment = async (logId, paymentAmount) => {
    if (!dbConfigured) {
      setMasterLogs(prev => {
        const updated = prev.map(l => {
          if (l._id === logId) {
            const earnings = l.hours_logged * (l.pay_rate || 0);
            const currentPaid = l.amount_paid || 0;
            const newPaid = currentPaid + paymentAmount;
            let newStatus = 'unpaid';
            if (newPaid >= earnings) {
              newStatus = 'paid';
            } else if (newPaid > 0) {
              newStatus = 'partially_paid';
            }
            return { ...l, amount_paid: newPaid, payment_status: newStatus };
          }
          return l;
        });
        localStorage.setItem('masterLogs', JSON.stringify(updated));
        return updated;
      });
      toast.success('Payment recorded successfully (Mock Mode)');
      return;
    }

    try {
      const response = await fetch(`/api/timesheet/logs/${logId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userSession.id,
          'x-user-role': userSession.role
        },
        body: JSON.stringify({ amount: paymentAmount })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to record payment');
      toast.success('Payment recorded successfully');
      fetchLogsHistory();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(`Failed to record payment: ${err.message}`);
    }
  }

  // 4. FILTERING & AGGREGATIONS

  // Employee history logs
  const employeeLogs = dbConfigured 
    ? masterLogs 
    : masterLogs.filter((log) => log.user_id === userSession?.id)

  // Admin Ledger search / project filters
  const filteredAdminLogs = masterLogs.filter((log) => {
    const matchesSearch =
      log.employee_email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      log.project_name.toLowerCase().includes(adminSearch.toLowerCase())

    const targetFilterVal = adminProjectFilter
    const matchesProject =
      targetFilterVal === 'all' || log.project_id === targetFilterVal

    return matchesSearch && matchesProject
  })

  // Aggregated metrics
  const totalHours = masterLogs.reduce((sum, log) => sum + log.hours_logged, 0)
  const totalLogs = masterLogs.length
  const activeProjectsCount = new Set(masterLogs.map((log) => log.project_id)).size

  // 5. VIEW SUB-COMPONENTS

  // Header System mode banner
  const renderConfigBanner = () => {
    if (dbConfigured) return null
    return (
      <Box
        p="3"
        mb="6"
        borderRadius="xl"
        bg="rgba(232, 185, 120, 0.12)"
        border="1px solid rgba(232, 185, 120, 0.25)"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="2"
      >
        <Text fontSize="xs" color="var(--accent-soft)" fontWeight="600">
          ⚠️ Running in local mockup mode. To connect MongoDB Atlas, add your connection string to the root `.env` file.
        </Text>
      </Box>
    )
  }

  // Render Login View
  const renderLoginView = () => (
    <Box {...dashboardStyles.loginCard}>
      <Heading as="h2" {...dashboardStyles.loginTitle}>
        Partner Portal
      </Heading>
      <Text {...dashboardStyles.loginSubtitle}>
        Access your Orogen timesheet & workspace
      </Text>

      <form onSubmit={handleLoginSubmit}>
        <Box mb="4">
          <Text
            as="label"
            htmlFor="email"
            display="block"
            fontSize="xs"
            fontWeight="700"
            color="var(--accent-soft)"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb="2"
          >
            Email Address
          </Text>
          <Box
            as="input"
            type="email"
            id="email"
            required
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="e.g., you@company.com"
            {...dashboardStyles.input}
          />
        </Box>

        <Box mb="6">
          <Text
            as="label"
            htmlFor="password"
            display="block"
            fontSize="xs"
            fontWeight="700"
            color="var(--accent-soft)"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mb="2"
          >
            Password
          </Text>
          <Box
            as="input"
            type="password"
            id="password"
            required
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            {...dashboardStyles.input}
          />
        </Box>

        {loginError && (
          <Box
            p="3.5"
            bg="rgba(200, 142, 85, 0.12)"
            border="1px solid var(--accent-strong)"
            borderRadius="xl"
            mb="6"
          >
            <Text fontSize="xs" color="var(--accent-strong)" fontWeight="600">
              {loginError}
            </Text>
          </Box>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          {...dashboardStyles.submitBtn}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </Button>
      </form>
    </Box>
  )

  // Render Employee View
  const renderEmployeeView = () => {
    const hasProjects = projectsList.length > 0;

    return (
      <Box>
        <Box {...dashboardStyles.navHeader}>
          <Box>
            <Text fontSize="xs" color="var(--accent-soft)" letterSpacing="0.08em" textTransform="uppercase" fontWeight="700">
              Employee Workspace
            </Text>
            <Text {...dashboardStyles.userEmail}>{userSession.email}</Text>
          </Box>
          <Button onClick={handleLogout} {...dashboardStyles.logoutBtn}>
            Log Out
          </Button>
        </Box>

        <Heading as="h2" {...dashboardStyles.dashTitle}>
          Track Your Work
        </Heading>
        <Text {...dashboardStyles.dashSub}>
          Log your hours below. Submissions are synced dynamically to our team ledger.
        </Text>

        {!hasProjects && (
          <Box
            p="4"
            mb="6"
            borderRadius="xl"
            bg="rgba(200, 142, 85, 0.12)"
            border="1px solid var(--accent-strong)"
          >
            <Text fontSize="sm" color="var(--accent-soft)" fontWeight="600">
              ⚠️ No projects are currently registered in the system. Please contact your system administrator to register projects before logging hours.
            </Text>
          </Box>
        )}

        {/* Entry Form */}
        <Box {...dashboardStyles.formCard} opacity={hasProjects ? 1 : 0.6}>
          <form onSubmit={handleTimesheetSubmit}>
            <SimpleGrid {...dashboardStyles.formGrid}>
              <Box {...dashboardStyles.formGroup}>
                <Text as="label" htmlFor="project" {...dashboardStyles.formLabel}>
                  Project
                </Text>
                <Box
                  as="select"
                  id="project"
                  disabled={!hasProjects}
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  {...dashboardStyles.input}
                  style={{
                    ...dashboardStyles.input,
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f7d8ac' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.2em',
                    paddingRight: '2.5rem',
                  }}
                >
                  {hasProjects ? (
                    projectsList.map((project) => (
                      <option
                        key={project._id || project.id}
                        value={project._id || project.id?.toString()}
                        style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-main)' }}
                      >
                        {project.name}
                      </option>
                    ))
                  ) : (
                    <option style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-muted)' }}>
                      No active projects
                    </option>
                  )}
                </Box>
              </Box>

              <Box {...dashboardStyles.formGroup}>
                <Text as="label" htmlFor="hours" {...dashboardStyles.formLabel}>
                  Hours Logged
                </Text>
                <Box
                  as="input"
                  type="number"
                  id="hours"
                  min="0.5"
                  max="24"
                  step="0.5"
                  required
                  disabled={!hasProjects}
                  value={hoursLogged}
                  onChange={(e) => setHoursLogged(e.target.value)}
                  placeholder="8"
                  {...dashboardStyles.input}
                />
              </Box>

              <Box {...dashboardStyles.formGroup}>
                <Text as="label" htmlFor="date" {...dashboardStyles.formLabel}>
                  Log Date
                </Text>
                <Box
                  as="input"
                  type="date"
                  id="date"
                  required
                  disabled={!hasProjects}
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  {...dashboardStyles.input}
                  style={{
                    ...dashboardStyles.input,
                    colorScheme: 'dark',
                  }}
                />
              </Box>
            </SimpleGrid>

            {/* Description Field */}
            <Box {...dashboardStyles.formGroup} mt="5">
              <Text as="label" htmlFor="description" {...dashboardStyles.formLabel}>
                Work Description (Max 500 words)
              </Text>
              <Box
                as="textarea"
                id="description"
                required
                disabled={!hasProjects}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the tasks completed during these hours..."
                {...dashboardStyles.input}
                style={{
                  ...dashboardStyles.input,
                  height: 'auto',
                  minHeight: '120px',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  resize: 'vertical',
                }}
              />
              <Text fontSize="xs" color={description.trim().split(/\s+/).filter(Boolean).length > 500 ? "red" : "var(--text-muted)"} textAlign="right">
                {description.trim().split(/\s+/).filter(Boolean).length} / 500 words
              </Text>
            </Box>

            <Box mt="6" display="flex" justifyContent="flex-end">
              <Button type="submit" disabled={!hasProjects || description.trim().split(/\s+/).filter(Boolean).length > 500} maxW={{ md: '200px' }} {...dashboardStyles.submitBtn}>
                Submit Hours
              </Button>
            </Box>
          </form>
        </Box>

        {/* Recent Logs Table */}
        <Heading as="h3" fontSize="xl" mb="4" fontFamily="heading">
          Recent Activity
        </Heading>
        <Box {...dashboardStyles.tableCard}>
          {employeeLogs.length === 0 ? (
            <Text color="var(--text-muted)" fontSize="sm" py="6" textAlign="center">
              No hours logged recently. Use the form above to add a log entry.
            </Text>
          ) : (
            <Box as="table" {...dashboardStyles.table}>
              <thead>
                <tr>
                  <Box as="th" {...dashboardStyles.th}>Date</Box>
                  <Box as="th" {...dashboardStyles.th}>Project Name</Box>
                  <Box as="th" {...dashboardStyles.th}>Description</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="center">Status</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Hours Logged</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Earnings</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Paid</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Remaining</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="center">Payment</Box>
                </tr>
              </thead>
              <tbody>
                {employeeLogs.map((log) => {
                  const totalEarnings = log.hours_logged * (log.pay_rate || 0)
                  const remaining = totalEarnings - (log.amount_paid || 0)
                  return (
                    <Box as="tr" key={log._id} {...dashboardStyles.tr}>
                      <Box as="td" {...dashboardStyles.td}>{log.log_date}</Box>
                      <Box as="td" {...dashboardStyles.td} fontWeight="600">{log.project_name}</Box>
                      <Box as="td" {...dashboardStyles.td} maxW="240px">
                        <CollapsibleText text={log.description} />
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="center">
                        <Box as="span" {...getStatusBadgeStyle(log.status)}>
                          {log.status}
                        </Box>
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-main)" fontWeight="600">
                        {log.hours_logged.toFixed(1)} hrs
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--accent-soft)" fontWeight="700">
                        {log.status === 'approved' 
                          ? formatEarnings(log.hours_logged, log.pay_rate || 0, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)" fontWeight="normal">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-soft)">
                        {log.status === 'approved'
                          ? formatEarnings(1, log.amount_paid || 0, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-main)" fontWeight="600">
                        {log.status === 'approved'
                          ? formatEarnings(1, remaining, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="center">
                        {log.status === 'approved' ? (
                          <Box as="span" {...getPaymentBadgeStyle(log.payment_status)}>
                            {log.payment_status}
                          </Box>
                        ) : (
                          <Text as="span" fontSize="xs" color="var(--text-muted)">N/A</Text>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </tbody>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  // Render Admin View
  const renderAdminView = () => {
    const pendingLogs = masterLogs.filter(log => log.status === 'pending')

    return (
      <Box>
        <Box {...dashboardStyles.navHeader}>
          <Box>
            <Text fontSize="xs" color="var(--accent-soft)" letterSpacing="0.08em" textTransform="uppercase" fontWeight="700">
              Orogen Control Room
            </Text>
            <Text {...dashboardStyles.userEmail}>Admin: {userSession.email}</Text>
          </Box>
          <Button onClick={handleLogout} {...dashboardStyles.logoutBtn}>
            Log Out
          </Button>
        </Box>

        <Heading as="h2" {...dashboardStyles.dashTitle}>
          System Overview
        </Heading>
        <Text {...dashboardStyles.dashSub}>
          Real-time telemetry on resource allocation, project velocities, and developer timesheets.
        </Text>

        {/* Analytics Cards Grid */}
        <SimpleGrid {...dashboardStyles.statsGrid}>
          <Box {...dashboardStyles.statCard}>
            <Text {...dashboardStyles.statValue}>{totalHours.toFixed(1)}</Text>
            <Text {...dashboardStyles.statLabel}>Total Hours Logged</Text>
          </Box>

          <Box {...dashboardStyles.statCard}>
            <Text {...dashboardStyles.statValue}>{totalLogs}</Text>
            <Text {...dashboardStyles.statLabel}>Timesheet Submissions</Text>
          </Box>

          <Box {...dashboardStyles.statCard}>
            <Text {...dashboardStyles.statValue}>{activeProjectsCount}</Text>
            <Text {...dashboardStyles.statLabel}>Active Projects Tracked</Text>
          </Box>
        </SimpleGrid>

        {/* Pending Approvals Section */}
        <Heading as="h3" fontSize="xl" mb="4" fontFamily="heading">
          Pending Timesheet Approvals ({pendingLogs.length})
        </Heading>
        <Box mb="10">
          {pendingLogs.length === 0 ? (
            <Box {...dashboardStyles.tableCard} p="6" textAlign="center">
              <Text color="var(--text-muted)" fontSize="sm">
                No pending timesheet approval requests. Excellent!
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
              {pendingLogs.map((log) => (
                <Box
                  key={log._id}
                  p="5"
                  borderRadius="xl"
                  border="1px solid var(--surface-line)"
                  bg="var(--surface-strong)"
                  boxShadow="var(--shadow-soft)"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  gap="3"
                >
                  <Box>
                    <Flex justify="space-between" align="center" mb="2" flexWrap="wrap" gap="2">
                      <Box>
                        <Text fontWeight="700" color="var(--accent-soft)" fontSize="sm">
                          {log.employee_email}
                        </Text>
                        <Text fontSize="xs" color="var(--text-muted)">
                          Logged on {log.log_date} for <strong style={{ color: 'var(--text-main)' }}>{log.project_name}</strong>
                        </Text>
                      </Box>
                      <Text fontWeight="800" color="var(--accent)" fontSize="md">
                        {log.hours_logged.toFixed(1)} hrs
                      </Text>
                    </Flex>
                    <Box
                      p="3"
                      borderRadius="lg"
                      bg="rgba(0, 0, 0, 0.2)"
                      border="1px solid rgba(255, 255, 255, 0.05)"
                      maxH="180px"
                      overflowY="auto"
                    >
                      <Text fontSize="10px" fontWeight="700" color="var(--text-muted)" mb="1" textTransform="uppercase" letterSpacing="0.05em">
                        Description:
                      </Text>
                      <Text fontSize="xs" style={{ whiteSpace: 'pre-wrap' }}>
                        {log.description}
                      </Text>
                    </Box>
                  </Box>
                  <Flex gap="3" justify="flex-end" mt="2">
                    <Button
                      size="xs"
                      onClick={() => handleUpdateLogStatus(log._id, 'rejected')}
                      style={{
                        borderRadius: 'lg',
                        border: '1px solid rgba(245, 101, 101, 0.4)',
                        bg: 'rgba(245, 101, 101, 0.1)',
                        color: '#f56565',
                        height: '2rem',
                        px: '3',
                      }}
                      _hover={{ bg: 'rgba(245, 101, 101, 0.2)' }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleUpdateLogStatus(log._id, 'approved')}
                      style={{
                        borderRadius: 'lg',
                        border: '1px solid rgba(72, 187, 120, 0.4)',
                        bg: 'rgba(72, 187, 120, 0.1)',
                        color: '#48bb78',
                        height: '2rem',
                        px: '3',
                      }}
                      _hover={{ bg: 'rgba(72, 187, 120, 0.2)' }}
                    >
                      Approve
                    </Button>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Project Setup & Rates Panel */}
        <Box {...dashboardStyles.formCard} mb="10">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="8">
            {/* Create Project Form */}
            <Box>
              <Heading as="h3" fontSize="md" mb="4" fontFamily="heading" color="var(--accent-soft)" letterSpacing="0.08em" textTransform="uppercase" fontWeight="700">
                Register New Project
              </Heading>
              <form onSubmit={handleCreateProjectSubmit}>
                <Box {...dashboardStyles.formGroup} mb="4">
                  <Text as="label" htmlFor="newProjectName" {...dashboardStyles.formLabel}>
                    Project Name
                  </Text>
                  <Box
                    as="input"
                    type="text"
                    id="newProjectName"
                    required
                    placeholder="e.g., Summit Lab AI"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    {...dashboardStyles.input}
                  />
                </Box>
                <Button
                  type="submit"
                  disabled={isCreatingProject}
                  {...dashboardStyles.submitBtn}
                >
                  {isCreatingProject ? 'Registering...' : 'Register Project'}
                </Button>
              </form>
            </Box>

            {/* Project Rates Configuration */}
            <Box>
              <Heading as="h3" fontSize="md" mb="4" fontFamily="heading" color="var(--accent-soft)" letterSpacing="0.08em" textTransform="uppercase" fontWeight="700">
                Project Billing Configuration
              </Heading>
              <Box maxH="280px" overflowY="auto" border="1px solid var(--surface-line)" borderRadius="xl" p="2" bg="rgba(0,0,0,0.1)">
                {projectsList.length === 0 ? (
                  <Text color="var(--text-muted)" fontSize="sm" py="6" textAlign="center">
                    No projects registered yet.
                  </Text>
                ) : (
                  <Box as="table" {...dashboardStyles.table} style={{ ...dashboardStyles.table, minWidth: '100%' }}>
                    <thead>
                      <tr>
                        <Box as="th" {...dashboardStyles.th} py="2" px="2" fontSize="10px">Project</Box>
                        <Box as="th" {...dashboardStyles.th} py="2" px="2" fontSize="10px">Rate/Hr</Box>
                        <Box as="th" {...dashboardStyles.th} py="2" px="2" fontSize="10px">Currency</Box>
                        <Box as="th" {...dashboardStyles.th} py="2" px="2" fontSize="10px" textAlign="right">Action</Box>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsList.map((project) => (
                        <ProjectRateConfigRow 
                          key={project._id || project.id} 
                          project={project} 
                          onSave={handleUpdateProjectRate} 
                        />
                      ))}
                    </tbody>
                  </Box>
                )}
              </Box>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Filtering Row */}
        <Box {...dashboardStyles.filterRow}>
          <Box flex="1">
            <Box
              as="input"
              type="text"
              placeholder="Search by employee email or project name..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              {...dashboardStyles.input}
            />
          </Box>
          <Box w={{ base: '100%', md: '240px' }}>
            <Box
              as="select"
              value={adminProjectFilter}
              onChange={(e) => setAdminProjectFilter(e.target.value)}
              {...dashboardStyles.input}
              style={{
                ...dashboardStyles.input,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f7d8ac' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.2em',
                paddingRight: '2.5rem',
              }}
            >
              <option
                value="all"
                style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-main)' }}
              >
                All Projects
              </option>
              {projectsList.map((project) => (
                <option
                  key={project._id || project.id}
                  value={project._id || project.id?.toString()}
                  style={{ backgroundColor: 'var(--page-bg-base)', color: 'var(--text-main)' }}
                >
                  {project.name}
                </option>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Global Master Table */}
        <Heading as="h3" fontSize="xl" mb="4" fontFamily="heading">
          Global Ledger
        </Heading>
        <Box {...dashboardStyles.tableCard}>
          {filteredAdminLogs.length === 0 ? (
            <Text color="var(--text-muted)" fontSize="sm" py="6" textAlign="center">
              No timesheet logs match the search query or project filter.
            </Text>
          ) : (
            <Box as="table" {...dashboardStyles.table}>
              <thead>
                <tr>
                  <Box as="th" {...dashboardStyles.th}>Date</Box>
                  <Box as="th" {...dashboardStyles.th}>Employee Email</Box>
                  <Box as="th" {...dashboardStyles.th}>Project Name</Box>
                  <Box as="th" {...dashboardStyles.th}>Description</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="center">Status</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Hours Logged</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Earnings</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Paid</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Remaining</Box>
                  <Box as="th" {...dashboardStyles.th} textAlign="right">Payment Action</Box>
                </tr>
              </thead>
              <tbody>
                {filteredAdminLogs.map((log) => {
                  const totalEarnings = log.hours_logged * (log.pay_rate || 0)
                  const remaining = totalEarnings - (log.amount_paid || 0)
                  return (
                    <Box as="tr" key={log._id} {...dashboardStyles.tr}>
                      <Box as="td" {...dashboardStyles.td}>{log.log_date}</Box>
                      <Box as="td" {...dashboardStyles.td} color="var(--text-soft)">{log.employee_email}</Box>
                      <Box as="td" {...dashboardStyles.td} fontWeight="600">{log.project_name}</Box>
                      <Box as="td" {...dashboardStyles.td} maxW="200px">
                        <CollapsibleText text={log.description} />
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="center">
                        <Box as="span" {...getStatusBadgeStyle(log.status)}>
                          {log.status}
                        </Box>
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-main)" fontWeight="600">
                        {log.hours_logged.toFixed(1)} hrs
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--accent-soft)" fontWeight="700">
                        {log.status === 'approved' 
                          ? formatEarnings(log.hours_logged, log.pay_rate || 0, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)" fontWeight="normal">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-soft)">
                        {log.status === 'approved'
                          ? formatEarnings(1, log.amount_paid || 0, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right" color="var(--text-main)" fontWeight="600">
                        {log.status === 'approved'
                          ? formatEarnings(1, remaining, log.currency || 'USD')
                          : <Text as="span" fontSize="xs" color="var(--text-muted)">N/A</Text>
                        }
                      </Box>
                      <Box as="td" {...dashboardStyles.td} textAlign="right">
                        {log.status === 'approved' ? (
                          <LogPaymentCell log={log} onPay={handleLogPayment} formatEarnings={formatEarnings} />
                        ) : (
                          <Text as="span" fontSize="xs" color="var(--text-muted)">-</Text>
                        )}
                      </Box>
                    </Box>
                  )
                })}
              </tbody>
            </Box>
          )}
        </Box>
      </Box>
    )
  }

  if (loading && dbConfigured && !userSession) {
    return (
      <Box {...dashboardStyles.pageWrapper} display="grid" placeItems="center">
        <Text color="var(--accent)" fontSize="lg" fontWeight="600">
          Syncing secure workspace...
        </Text>
      </Box>
    )
  }

  return (
    <Box {...dashboardStyles.pageWrapper}>
      {/* Visual background matching Home page */}
      <Box aria-hidden="true" {...dashboardStyles.backdrop}>
        <Box {...dashboardStyles.orbOne} />
        <Box {...dashboardStyles.orbTwo} />
        <Box {...dashboardStyles.gridHaze} />
      </Box>

      <Box {...dashboardStyles.container}>
        {renderConfigBanner()}
        {userSession === null && renderLoginView()}
        {userSession?.role === 'employee' && renderEmployeeView()}
        {userSession?.role === 'admin' && renderAdminView()}
      </Box>
    </Box>
  )
}

export default Dashboard
