import { injectable, inject } from 'tsyringe';
import { DoctorRepository } from '../repositories/DoctorRepository';

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
}