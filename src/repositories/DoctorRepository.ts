import { injectable } from 'tsyringe';
import { Op } from 'sequelize';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';

@injectable()
export class DoctorRepository {
  async findAll(filters: any) {
    const whereClause: any = {};
    
    if (filters.speciality) {
      whereClause.speciality = { [Op.iLike]: `%${filters.speciality}%` }; 
    }

    return await Doctor.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user', 
        attributes: ['first_name', 'last_name', 'email']
      }]
    });
  }
}