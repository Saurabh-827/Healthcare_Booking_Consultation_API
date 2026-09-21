import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { PaymentService } from '../services/PaymentService';

export class PaymentController {
  static async pay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idempotencyKey = req.headers['x-idempotency-key'] as string;
      const { appointment_id, amount } = req.body;

      const paymentService = container.resolve(PaymentService);
      const result = await paymentService.processPayment(
        appointment_id,
        amount,
        idempotencyKey
      );

      res.status(result.isCachedResponse ? 200 : 201).json({
        success: true,
        message: result.message,
        data: result.payment
      });
    } catch (error) {
      next(error);
    }
  }
}