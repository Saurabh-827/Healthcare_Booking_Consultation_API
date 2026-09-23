import { Queue, Worker, Job } from 'bullmq';
import { logger } from '../utils/logger';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  enableReadyCheck: false,
  maxRetriesPerRequest: null
};

export const emailQueue = new Queue('emailQueue', { connection });

export const sendEmailJob = async (email: string, subject: string, data: any) => {
  await emailQueue.add('email-job', { type: 'Prescription', email, subject, data });
  logger.info(`[Queue] Job added for ${email}`);
};

let emailWorker: Worker;

export const startEmailWorker = () => {
  if (emailWorker) return;

  emailWorker = new Worker('emailQueue', async (job: Job) => {
    const { type, email, subject, data } = job.data;
    logger.info(`[Worker] Started sending ${type} email to ${email}`);

    // Simulating Email Sending
    await new Promise((resolve) => setTimeout(resolve, 2000));

    logger.info(`[Worker] Successfully sent email to ${email}. Payload: ${JSON.stringify(data)}`);
  }, { connection });

  emailWorker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
  });

  logger.info('[Worker] Email worker initialized and listening to queue.');
};
