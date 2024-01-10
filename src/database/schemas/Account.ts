import { InferAttributes, InferCreationAttributes, ModelOptions, Sequelize } from 'sequelize';
import { TimestampModel } from './base';
import { IAccount } from '@/models/authentication/authentication';

const USER_ROLES: readonly any[] = ['user', 'editor', 'manager', 'admin'];

export class Account
  extends TimestampModel<InferAttributes<Account>, InferCreationAttributes<Account>>
  implements IAccount
{
  declare email: string;
  declare password: string;
  declare role: string;
  declare passwordResetPinExpirationTime?: Date;
  declare passwordResetPin?: string;
  declare passwordRecoveryAttempts?: number;
}

const columns = (DataTypes: any) => ({
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    allowNull: true,
    validate: {
      isIn: USER_ROLES,
    },
  },

  passwordResetPinExpirationTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  passwordPin: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  passwordRecoveryAttempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },

  updatedAt: DataTypes.DATE,
  createdAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE,
});

const options: ModelOptions = {
  timestamps: true,
  tableName: 'accounts',
};

export default function createAccount(sequelize: Sequelize, DataTypes: any) {
  return sequelize.define('Account', columns(DataTypes), options);
}
