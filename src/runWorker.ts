import { connectDB } from './config/database';
import { startEmailWorker } from './workers/email.worker';

const initWorker = async () => {
  await connectDB();
  startEmailWorker();
};

initWorker();