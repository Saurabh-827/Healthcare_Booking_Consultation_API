import { injectable } from 'tsyringe';
import { Prescription } from '../models/Prescription';

@injectable()
export class PrescriptionRepository {
  async create(data: any) {
    return await Prescription.create(data);
  }
}