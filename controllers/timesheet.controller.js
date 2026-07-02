import User from '../models/User.js';
import Project from '../models/Project.js';
import TimesheetLog from '../models/TimesheetLog.js';

// Authenticate user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};

// Get active projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ is_active: true }).sort({ name: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching projects: ' + err.message });
  }
};

// Get timesheet logs
export const getLogs = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      return res.status(401).json({ error: 'Unauthorized: missing session headers' });
    }

    let query = {};
    // If regular employee, filter by their own user_id
    if (userRole === 'employee') {
      query.user_id = userId;
    }

    const logs = await TimesheetLog.find(query)
      .populate('user_id', 'email')
      .populate('project_id', 'name pay_rate currency')
      .sort({ log_date: -1, createdAt: -1 });

    // Format output matching the frontend schema
    const formatted = logs.map(log => ({
      _id: log._id.toString(),
      user_id: log.user_id?._id?.toString() || '',
      employee_email: log.user_id?.email || 'unknown@company.com',
      project_id: log.project_id?._id?.toString() || '',
      project_name: log.project_id?.name || 'Unknown Project',
      pay_rate: log.project_id?.pay_rate || 0,
      currency: log.project_id?.currency || 'USD',
      hours_logged: log.hours_logged,
      log_date: log.log_date,
      description: log.description || '',
      status: log.status || 'pending',
      amount_paid: log.amount_paid || 0,
      payment_status: log.payment_status || 'unpaid'
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching timesheet logs: ' + err.message });
  }
};

// Submit a log entry
export const createLog = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      return res.status(401).json({ error: 'Unauthorized: missing session headers' });
    }

    if (userRole === 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins cannot log timesheet hours' });
    }

    const { project_id, hours_logged, log_date, description } = req.body;
    if (!project_id || !hours_logged || !log_date || !description) {
      return res.status(400).json({ error: 'Missing required log fields (project, hours, date, and description)' });
    }

    const hours = parseFloat(hours_logged);
    if (isNaN(hours) || hours < 0.5 || hours > 24) {
      return res.status(400).json({ error: 'Hours must be between 0.5 and 24' });
    }

    // Validate description word count (max 500 words)
    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 500) {
      return res.status(400).json({ error: `Description must not exceed 500 words (currently ${wordCount} words)` });
    }

    // Verify project exists
    const project = await Project.findById(project_id);
    if (!project || !project.is_active) {
      return res.status(400).json({ error: 'Selected project is invalid or inactive' });
    }

    const newLog = new TimesheetLog({
      user_id: userId,
      project_id: project_id,
      log_date: log_date,
      hours_logged: hours,
      description: description.trim(),
      status: 'pending'
    });

    await newLog.save();
    res.status(201).json({ message: 'Log submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting log: ' + err.message });
  }
};

// Create a new project (Admin only)
export const createProject = async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can create projects' });
    }

    const { name, pay_rate, currency } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const existingProject = await Project.findOne({ name: name.trim() });
    if (existingProject) {
      return res.status(400).json({ error: 'A project with this name already exists' });
    }

    const newProject = new Project({
      name: name.trim(),
      is_active: true,
      pay_rate: pay_rate !== undefined ? parseFloat(pay_rate) : 0,
      currency: currency || 'USD'
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: 'Error creating project: ' + err.message });
  }
};

// Update timesheet log status (Admin only)
export const updateLogStatus = async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can modify log status' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    const log = await TimesheetLog.findById(id);
    if (!log) {
      return res.status(404).json({ error: 'Timesheet log not found' });
    }

    log.status = status;
    await log.save();

    res.json({ message: `Timesheet hours successfully ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Error updating timesheet status: ' + err.message });
  }
};

// Update project pay rate and currency (Admin only)
export const updateProjectRate = async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can update project billing rates' });
    }

    const { id } = req.params;
    const { pay_rate, currency } = req.body;

    if (pay_rate === undefined || !currency) {
      return res.status(400).json({ error: 'Missing pay_rate or currency' });
    }

    const rate = parseFloat(pay_rate);
    if (isNaN(rate) || rate < 0) {
      return res.status(400).json({ error: 'Pay rate must be a non-negative number' });
    }

    if (!['INR', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Currency must be INR or USD' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.pay_rate = rate;
    project.currency = currency;
    await project.save();

    res.json({ message: 'Project billing rate updated successfully', project });
  } catch (err) {
    res.status(500).json({ error: 'Error updating project billing rate: ' + err.message });
  }
};

// Record payment for an approved timesheet log (Admin only)
export const logPayment = async (req, res) => {
  try {
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Only administrators can record payments' });
    }

    const { id } = req.params;
    const { amount } = req.body;

    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid payment amount greater than 0 is required' });
    }

    const payAmount = parseFloat(amount);

    // Find the log and populate project to calculate total earnings
    const log = await TimesheetLog.findById(id).populate('project_id');
    if (!log) {
      return res.status(404).json({ error: 'Timesheet log not found' });
    }

    if (log.status !== 'approved') {
      return res.status(400).json({ error: 'Cannot log payments on unapproved hours' });
    }

    const payRate = log.project_id?.pay_rate || 0;
    const totalEarnings = log.hours_logged * payRate;
    const currentPaid = log.amount_paid || 0;
    const remaining = totalEarnings - currentPaid;

    if (payAmount > remaining) {
      return res.status(400).json({ error: `Payment amount (${payAmount}) exceeds remaining balance (${remaining})` });
    }

    log.amount_paid = currentPaid + payAmount;
    
    // Recalculate payment status
    if (log.amount_paid >= totalEarnings) {
      log.payment_status = 'paid';
    } else {
      log.payment_status = 'partially_paid';
    }

    await log.save();

    res.json({
      message: 'Payment recorded successfully',
      amount_paid: log.amount_paid,
      payment_status: log.payment_status,
      remaining: totalEarnings - log.amount_paid
    });
  } catch (err) {
    res.status(500).json({ error: 'Error logging payment: ' + err.message });
  }
};
