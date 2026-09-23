import { injectable } from 'tsyringe';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { Payment } from '../models/Payment';

@injectable()
export class AdminService {
  async getDashboardStats() {
    // 1. User Stats
    const totalPatients = await User.count({ where: { role: 'Patient' } });
    const totalDoctors = await Doctor.count();

    // 2. Appointment Stats
    const totalAppointments = await Appointment.count();
    const pendingAppointments = await Appointment.count({ where: { status: 'pending' } });
    const completedAppointments = await Appointment.count({ where: { status: 'completed' } });

    // 3. Revenue Stats 
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });

    return {
      users: {
        total_patients: totalPatients,
        total_doctors: totalDoctors
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments
      },
      revenue: {
        total_earnings: totalRevenue || 0 
      }
    };
  }
}