import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Appointment } from './Appointment';

export class Prescription extends Model {
  public declare id: string;
  public declare appointment_id: string;
  public declare symptoms: string;
  public declare diagnosis: string;
  public declare medicines: object[]; 
  public declare notes: string;
}

Prescription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: Appointment, key: 'id' }
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    medicines: {
      type: DataTypes.JSONB, 
      allowNull: false,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Prescriptions',
    timestamps: true,
  }
);

// Relationships (Associations)
Appointment.hasOne(Prescription, { foreignKey: 'appointment_id', as: 'prescription' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });