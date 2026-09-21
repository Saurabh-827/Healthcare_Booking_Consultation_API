import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { Appointment } from './Appointment';

export class Payment extends Model {
  public id!: string;
  public appointment_id!: string;
  public amount!: number;
  public status!: 'pending' | 'completed' | 'failed';
  public idempotency_key!: string;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Appointment, key: 'id' }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
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
    tableName: 'Payments',
    timestamps: true,
  }
);

// Relationships
Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });