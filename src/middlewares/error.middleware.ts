import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // custom error (e.g., 400 Bad Request, 404 Not Found)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } 
  // Database Duplicate Entry (Sequelize Error)
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Data already exists in our system.';
  } 
  // database validation error
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.message;
  }

  console.error(`[Error] ${statusCode} - ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};