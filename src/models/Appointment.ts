import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class Appointment extends Model {
  public declare id: string;
  public declare patient_id: string;
  public declare doctor_id: string;
  public declare appointment_date: Date;
  public declare status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  public declare idempotency_key: string; 
}

Appointment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' }
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' }
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      defaultValue: 'pending',
    },
    idempotency_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, 
    },
  },
  {
    sequelize,
    tableName: 'Appointments',
    timestamps: true,
  }
);

// Relationships (Associations) mapping
User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });