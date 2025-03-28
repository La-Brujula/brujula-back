import {
  IAccount,
  AccountRoleType,
  ACCOUNT_ROLES,
  AccountContactMethod,
  ACCOUNT_CONTACT_METHODS,
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

  @Column(DataType.ENUM(...ACCOUNT_ROLES))
  role!: AccountRoleType;

  @Column(DataType.ENUM(...ACCOUNT_CONTACT_METHODS))
  contactMethod: AccountContactMethod = 'email';

  @Column
  jobNotifications: boolean = true;

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
