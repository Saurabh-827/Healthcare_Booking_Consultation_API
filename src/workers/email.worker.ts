import { Queue, Worker, Job } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  enableReadyCheck: false,
  maxRetriesPerRequest: null
};

// 1. Queue
export const emailQueue = new Queue('emailQueue', { connection });

// 2. Job add function
export const sendEmailJob = async (email: string, subject: string, data: any) => {
  await emailQueue.add('email-job', { type: 'Prescription', email, subject, data });
  console.log(`[Queue] Job added for ${email}`);
};

let emailWorker: Worker;

export const startEmailWorker = () => {
  if (emailWorker) return; 

  emailWorker = new Worker('emailQueue', async (job: Job) => {
    const { type, email, subject, data } = job.data;

    console.log(`[Worker] Started sending ${type} email to ${email}...`);
    
    // Simulating Email Sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log(`[Worker] Successfully sent email to ${email}. Payload:`, data);
  }, { connection });

  emailWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job?.id} failed with error ${err.message}`);
  });

  console.log('[Worker] Email worker initialized and listening to queue.');
};
