import './models/User';
import './models/Doctor';
import './models/Appointment';
import './models/Payment';
import './models/Prescription';
import './models/AuditLog';

import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();