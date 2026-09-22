import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

export const metricsRegistry = new Registry();

// Node.js default metrics (Memory, CPU) collect
collectDefaultMetrics({ register: metricsRegistry });

// Custom Metric: Total HTTP Requests
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [metricsRegistry],
});

// Custom Metric: Request Duration (Latency calculate)
export const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // seconds
  registers: [metricsRegistry],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startEpoch = Date.now();
  
  res.on('finish', () => {
    const responseTimeInSeconds = (Date.now() - startEpoch) / 1000;
    
    // Counter
    httpRequestCounter.labels(req.method, req.route ? req.route.path : req.path, res.statusCode.toString()).inc();
    
    // Latency record 
    httpRequestDurationMicroseconds.labels(req.method, req.route ? req.route.path : req.path, res.statusCode.toString()).observe(responseTimeInSeconds);
  });
  
  next();
};