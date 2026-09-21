import { injectable } from 'tsyringe';
import { Payment } from '../models/Payment';

@injectable()
export class PaymentRepository {
  async findByIdempotencyKey(key: string) {
    return await Payment.findOne({ where: { idempotency_key: key } });
  }

  async create(data: any) {
    return await Payment.create(data);
  }
}