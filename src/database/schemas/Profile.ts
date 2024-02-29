import { IProfile } from '@/models/profile/profile';
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
  Is,
  IsDate,
  IsEmail,
  IsUUID,
  IsUrl,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import { ProfileMapper } from '@/models/profile/profileMapper';
import Account from './Account';

const ACTIVITY_REGEX = /\d{3}-\d{2}/;

@Table({ tableName: 'profiles', modelName: 'Profile' })
export default class Profile extends Model implements IProfile {
  @Default(UUIDV4)
  @IsUUID(4)
  @PrimaryKey
  @Column
  id!: string;

  @IsEmail
  @Column
  primaryEmail!: string;

  @Column(DataType.ENUM('moral', 'fisica'))
  type!: 'moral' | 'fisica';

  @Default(false)
  @Column
  searchable!: boolean;

  @Default(0)
  @Column
  recommendationsCount!: number;

  @Default(false)
  @Column
  subscriber!: boolean;

  @Column firstName?: string;
  @Column lastName?: string;

  @Column(DataType.VIRTUAL(DataType.STRING, ['firstName']))
  get fullName(): string | undefined {
    const firstName = this.getDataValue('firstName'),
      lastName = this.getDataValue('lastName');
    if (!firstName && !lastName) return undefined;
    return [firstName, lastName].filter((a) => !!a).join(' ');
  }

  @Column nickName?: string;

  @Column(DataType.ENUM('male', 'female', 'other'))
  gender?: 'male' | 'female' | 'other';

  @Is('Activity', (v) => ACTIVITY_REGEX.test(v))
  @Column
  primaryActivity?: string;

  @Is('Activity', (v) => ACTIVITY_REGEX.test(v))
  @Column
  secondaryActivity?: string;

  @Is('Activity', (v) => ACTIVITY_REGEX.test(v))
  @Column
  thirdActivity?: string;

  @AllowNull
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  secondaryEmails?: string[];

  @AllowNull
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  phoneNumbers?: string[];

  @AllowNull
  @Column(DataType.ARRAY(DataType.STRING))
  get languages(): { lang: string; proficiency: string }[] {
    return this.getDataValue('languages')?.map((v: string) => {
      const [lang, proficiency] = v.split(':');
      return { lang, proficiency };
    });
  }

  @AllowNull
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  externalLinks?: string[];

  @Column whatsapp?: string;
  @Column imdb?: string;
  @Column facebook?: string;
  @Column instagram?: string;
  @Column vimeo?: string;
  @Column youtube?: string;
  @Column linkedin?: string;
  @Column twitter?: string;
  @Column tiktok?: string;
  @Column headline?: string;

  @Column state?: string;
  @Column city?: string;
  @Column country?: string;
  @Column postalCode?: string;

  @Column(
    DataType.VIRTUAL(DataType.STRING, [
      'city',
      'state',
      'country',
      'postalCode',
    ])
  )
  get location(): string {
    return [
      this.get('city'),
      this.get('state'),
      this.get('country'),
      !!this.get('postalCode') && 'CP: ' + this.get('postalCode'),
    ]
      .filter((v) => !!v)
      .join(', ');
  }

  @Column university?: string;
  @Column(DataType.TEXT) associations?: string;
  @Column(DataType.TEXT) certifications?: string;

  @Column
  probono?: boolean;

  @Column
  remote?: boolean;

  @IsUrl
  @Column
  profilePictureUrl?: string;

  @IsUrl
  @Column
  headerPictureUrl?: string;

  @IsDate
  @Column
  birthday?: Date;

  @Column(DataType.ENUM('local', 'state', 'national', 'international'))
  workRadius?: 'local' | 'state' | 'national' | 'international';

  @Column(DataType.TEXT)
  searchString?: string;

  @BelongsToMany(
    () => Profile,
    () => ProfileRecommendations,
    'profileId',
    'recommendedBy'
  )
  recommendations!: Profile[];

  @CreatedAt
  createdAt!: Date;
  @UpdatedAt
  updatedAt!: Date;
  @DeletedAt
  deletedAt!: Date;

  @BeforeUpdate
  static async updateVector(instance: Profile) {
    instance.setDataValue(
      'recommendationsCount',
      await instance.$count('recommendations')
    );
    instance.setDataValue(
      'searchable',
      ['primaryActivity', 'firstName', 'gender'].every((p) => !!instance.get(p))
    );
    instance.setDataValue(
      'searchString',
      [
        instance.get('fullName'),
        instance.get('nickname'),
        instance.get('primaryEmail'),
        instance.get('secondaryEmails'),
        instance.get('phoneNumbers'),
        instance.get('primaryActivity'),
        instance.get('secondaryActivity'),
        instance.get('thirdActivity'),
        instance.get('location'),
        instance.get('certifications'),
        instance.get('associations'),
        instance.get('university'),
      ]
        .flat()
        .filter((a) => !!a)
        .join(' ')
    );
  }

  toDTO() {
    return ProfileMapper.toDto(this);
  }
}

@Table({
  tableName: 'profile_recommendations',
  modelName: 'ProfileRecommendations',
})
export class ProfileRecommendations extends Model {
  @ForeignKey(() => Profile)
  @Column
  profileId!: string;

  @ForeignKey(() => Profile)
  @Column
  recommendedBy!: string;
}
