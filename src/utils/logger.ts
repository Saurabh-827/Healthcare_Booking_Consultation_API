import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Console colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Console Format (Coloured)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  // error
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.json(),
  }),
  // log (info, http, error)
  new winston.transports.File({ 
    filename: 'logs/all.log',
    format: winston.format.json(), 
  }),
];

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports,
});