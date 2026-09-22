import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export class AuditLog extends Model {
  public declare id: string;
  public declare user_id: string;     
  public declare action: string;      
  public declare entity: string;      
  public declare entity_id: string;    
  public declare details: any;         
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, 
      references: { model: User, key: 'id' }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'AuditLogs',
    timestamps: true, 
  }
);

// Relationships Setup
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });