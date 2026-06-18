import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';

// Models for Seeding
import User from './models/User.js';
import Project from './models/Project.js';

// Routes
import timesheetRoutes from './routes/timesheet.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, 'client', 'dist');

app.use(express.json());
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/timesheet', timesheetRoutes);

// Keep API routes above this catch-all so client-side routing
// does not intercept backend endpoints.
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Connect to MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;

async function seedDefaultUsers() {
  try {
    const adminExists = await User.findOne({ email: 'admin@orogen.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@orogen.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('🌱 Seeded default admin user (admin@orogen.com / admin123)');
    }

    const employeeExists = await User.findOne({ email: 'employee@orogen.com' });
    if (!employeeExists) {
      const employee = new User({
        email: 'employee@orogen.com',
        password: 'employee123',
        role: 'employee'
      });
      await employee.save();
      console.log('🌱 Seeded default employee user (employee@orogen.com / employee123)');
    }
  } catch (err) {
    console.error('❌ Error seeding default users:', err.message);
  }
}

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(async () => {
      console.log('✅ Connected successfully to MongoDB Atlas database.');
      await seedDefaultUsers();
    })
    .catch(err => {
      console.error('❌ MongoDB Atlas connection error:', err.message);
    });
} else {
  console.warn('⚠️  MONGODB_URI is not defined in .env. Running Express server without database connectivity.');
}

app.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});
