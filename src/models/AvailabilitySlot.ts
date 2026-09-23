import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Doctor } from './Doctor';

export class AvailabilitySlot extends Model {
  public declare id: string;
  public declare doctor_id: string;
  public declare start_time: Date;
  public declare end_time: Date;
  public declare status: 'available' | 'booked' | 'cancelled';
}

AvailabilitySlot.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Doctor, key: 'id' }
    },
    start_time: {
      type: DataTypes.DATE, 
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'cancelled'),
      defaultValue: 'available',
    }
  },
  {
    sequelize,
    tableName: 'AvailabilitySlots',
    timestamps: true,
  }
);

// Relationships Setup
Doctor.hasMany(AvailabilitySlot, { foreignKey: 'doctor_id', as: 'slots' });
AvailabilitySlot.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });