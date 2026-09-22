import { User } from './models/User';
import { Doctor } from './models/Doctor';
import { Appointment } from './models/Appointment';
import { Payment } from './models/Payment';
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