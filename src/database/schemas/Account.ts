import {
  IAccount,
  AccountRoleTypes,
} from '@/models/authentication/authentication';
import Profile from './Profile';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  IsEmail,
  IsInt,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import Job from './Job';

@Table({ tableName: 'accounts', modelName: 'Account' })
export default class Account extends Model implements IAccount {
  @IsEmail
  @PrimaryKey
  @Column
  email!: string;

  @Column password!: string;
  @Column referal!: string;

  @Column(DataType.ENUM('user', 'editor', 'manager', 'admin'))
  role!: AccountRoleTypes;

  @IsInt
  @Column
  passwordRecoveryAttempts!: number;

  @Column passwordResetPinExpirationTime?: Date;

  @Column passwordResetPin?: string;

  @Column emailVerificationPinExpirationTime?: Date;

  @Column emailVerificationPin?: string;

  @ForeignKey(() => Profile)
  @Column
  ProfileId!: string;

  @BelongsTo(() => Profile)
  profile!: Profile;

  @HasMany(() => Job)
  jobs?: Job;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
