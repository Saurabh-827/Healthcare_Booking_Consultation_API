import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class Doctor extends Model {
  public declare id: string;
  public declare user_id: string;
  public declare speciality: string;
  public declare experience_years: number;
}

Doctor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: User, key: 'id' }
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  },
  {
    sequelize,
    tableName: 'Doctors',
    timestamps: true,
  }
);

// Relationships (Associations)
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });