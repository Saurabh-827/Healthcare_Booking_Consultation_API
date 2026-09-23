import { injectable, inject } from 'tsyringe';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { User } from '../models/User'; 
import { AppError } from '../utils/AppError';

@injectable()
export class DoctorService {
  constructor(
    @inject(DoctorRepository) private doctorRepository: DoctorRepository
  ) {}

  async searchDoctors(query: any) {
    const doctors = await this.doctorRepository.findAll(query);

    return doctors.map((doc:any) => {

        const cleanDoc = doc.toJSON();
        return {
          id: cleanDoc.user_id,
          first_name: cleanDoc.user?.first_name,
          last_name: cleanDoc.user?.last_name,
          speciality: cleanDoc.speciality,
          experience_years: cleanDoc.experience_years
        };
    });
  }
  async onboardDoctor(userId: string, speciality: string, experienceYears: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    user.role = 'Doctor';
    await user.save();

    const profile = await this.doctorRepository.createProfile({
      user_id: userId,
      speciality: speciality,
      experience_years: experienceYears
    });

    return profile;
  }
}