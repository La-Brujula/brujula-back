import { TJobOpening, TJobPosting } from '@/models/jobs/jobs';
import {
  AllowNull,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  HasMany,
  Is,
  IsDate,
  IsInt,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

import Account from './Account';
import { JobMapper } from '@/models/jobs/jobsMapper';
import IdReferents from '@shared/constants/idToKeywords.json';
import Profile from './Profile';

const ACTIVITY_REGEX = /\d{3}-\d{2}/;

@Table({ tableName: 'jobs', modelName: 'Job' })
export default class Job extends Model implements TJobPosting {
  @Default(UUIDV4)
  @IsUUID(4)
  @PrimaryKey
  @Column
  id!: string;

  @ForeignKey(() => Account)
  @Column
  requesterId!: string;

  @BelongsTo(() => Account)
  requester!: Account;

  @HasMany(() => JobOpening)
  openings!: JobOpening[];

  @IsDate
  @Column
  contactStartDate!: Date;

  @IsDate
  @Column
  contactEndDate!: Date;

  @Column contactEmail?: string;
  @Column whatsapp?: string;

  @AllowNull
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  phoneNumbers?: string[];

  @Column(DataType.ENUM('online', 'hybrid', 'in-person'))
  location!: 'online' | 'hybrid' | 'in-person';

  @Column(DataType.ENUM('local', 'state', 'national', 'international'))
  workRadius!: 'local' | 'state' | 'national' | 'international';

  @Column(DataType.ENUM('freelance', 'determinate', 'indeterminate'))
  employment!: 'freelance' | 'determinate' | 'indeterminate';

  @Column(DataType.TEXT) specialRequirements?: string;
  @Column(DataType.TEXT) description!: string;
  @Column(DataType.TEXT) benefits?: string;
  @Column(DataType.TEXT) notes?: string;

  @Column
  budgetLow!: number;

  @Column
  budgetHigh?: number;

  @IsDate
  @Column
  jobStartDate!: Date;

  @IsDate
  @Column
  jobEndDate!: Date;

  @CreatedAt
  createdAt!: Date;
  @UpdatedAt
  updatedAt!: Date;
  @DeletedAt
  deletedAt!: Date;
}

@Table({
  tableName: 'job_openings',
  modelName: 'JobOpenings',
  timestamps: true,
})
export class JobOpening extends Model implements TJobOpening {
  @Default(UUIDV4)
  @IsUUID(4)
  @PrimaryKey
  @Column
  id!: string;

  @ForeignKey(() => Job)
  @Column
  jobId!: string;

  @BelongsTo(() => Job)
  job!: Job;

  @Is('Activity', (v) => ACTIVITY_REGEX.test(v))
  @Column
  activity!: string;

  @IsInt
  @Column
  count!: number;

  @Column
  probono!: boolean;

  @Column(DataType.ENUM('male', 'female', 'other'))
  gender?: 'male' | 'female' | 'other';

  @Column
  ageRangeMin!: number;

  @Column
  ageRangeMax?: number;

  @AllowNull
  @Column(DataType.ARRAY(DataType.STRING))
  get languages(): {
    lang: string;
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
  }[] {
    return this.getDataValue('languages')?.map((v: string) => {
      return JSON.parse(v);
    });
  }

  @Column
  school!: string;

  @HasMany(() => JobOpeningsApplicants)
  applicants!: JobOpeningsApplicants[];

  @BelongsToMany(() => Profile, { through: () => JobOpeningsApplicants })
  profiles!: Profile[];

  @Column(DataType.TEXT)
  searchString?: string;

  @BeforeUpdate
  static async updateVector(opening: JobOpening) {
    opening.setDataValue(
      'searchString',
      [
        ...new Set(
          [opening.get('activity')].flatMap((activity) =>
            !!activity && activity in IdReferents
              ? IdReferents[activity as keyof typeof IdReferents]
              : null
          )
        ),
      ]
        .filter((a) => !!a)
        .join(' ')
    );
  }

  toDTO() {
    return JobMapper.toDto(this);
  }
}

@Table({
  tableName: 'job_openings_applicants',
  modelName: 'JobOpeningsApplicants',
})
export class JobOpeningsApplicants extends Model {
  @ForeignKey(() => Profile)
  @Column
  profileId!: string;

  @ForeignKey(() => JobOpening)
  @Column
  jobOpeningId!: string;

  @BelongsTo(() => Profile)
  profile!: Profile;

  @BelongsTo(() => JobOpening)
  opening!: JobOpening;
}
