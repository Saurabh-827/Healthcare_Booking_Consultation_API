import { injectable, inject } from 'tsyringe';
import { PrescriptionRepository } from '../repositories/PrescriptionRepository';
import { Appointment } from '../models/Appointment';
import { AppError } from '../utils/AppError';
import { sendEmailJob } from '../workers/email.worker';
import { AuditService } from './AuditService';

@injectable()
export class PrescriptionService {
  constructor(
    @inject(PrescriptionRepository) private prescriptionRepository: PrescriptionRepository
  ) {}

  async writePrescription(doctorId: string, appointmentId: string, prescriptionData: any) {
    // 1. Appointment verify 
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    const dbDoctorId = appointment.getDataValue('doctor_id') || (appointment as any).doctor_id;

    // 2. Security Check
    if (dbDoctorId !== doctorId) {
      throw new AppError(`Unauthorized: Token ID (${doctorId}) != DB ID (${dbDoctorId})`, 403);
    }

    // 3. New Prescription creation
    const prescription = await this.prescriptionRepository.create({
      appointment_id: appointmentId,
      ...prescriptionData
    });

    appointment.status = 'completed';
    await appointment.save();

    try {
      await sendEmailJob('raju.patient@amrutam.com', 'Your Prescription is Ready', { 
        message: 'Dr. Ramesh has uploaded your prescription.' 
      });
    } catch (err) {
      console.error('Failed to add email job to queue:', err);
    }

    await AuditService.logAction(
      doctorId, 
      'CREATE_PRESCRIPTION', 
      'Prescription', 
      prescription.id, 
      { appointmentId }
    );

    return prescription;
  }
}