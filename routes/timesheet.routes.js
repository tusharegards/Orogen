import express from 'express';
import mongoose from 'mongoose';
import {
  loginUser,
  getProjects,
  getLogs,
  createLog,
  createProject,
  updateLogStatus,
  updateProjectRate,
  logPayment
} from '../controllers/timesheet.controller.js';

const router = express.Router();

// Authentication
router.post('/auth/login', loginUser);

// Projects List
router.get('/projects', getProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProjectRate);

// Logs Ledger
router.get('/logs', getLogs);
router.post('/logs', createLog);
router.patch('/logs/:id/status', updateLogStatus);
router.patch('/logs/:id/payment', logPayment);

// Status Check
router.get('/status', (req, res) => {
  res.json({ 
    isConfigured: !!process.env.MONGODB_URI,
    isConnected: mongoose.connection.readyState === 1
  });
});

export default router;
