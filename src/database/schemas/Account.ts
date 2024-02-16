import { IAccount, AccountRoleTypes } from '@/models/authentication/authentication';
import Profile from './Profile';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  IsEmail,
  IsInt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'accounts', modelName: 'Account' })
export default class Account extends Model implements IAccount {
  @IsEmail
  @PrimaryKey
  @Column
  email!: string;

  @Column password!: string;

  @Column(DataType.ENUM('user', 'editor', 'manager', 'admin'))
  role!: AccountRoleTypes;

  @IsInt
  @Column
  passwordRecoveryAttempts!: number;

  @Column passwordResetPinExpirationTime?: Date;

  @Column passwordResetPin?: string;

  @ForeignKey(() => Profile)
  @Column
  ProfileId!: string;

  @BelongsTo(() => Profile)
  profile!: Profile;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
