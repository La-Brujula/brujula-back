import { IProfile } from '@/models/profile/profile';
import {
  BeforeUpdate,
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
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes, UUIDV4 } from 'sequelize';
import { ProfileMapper } from '@/models/profile/profileMapper';

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

  @Column({ type: DataTypes.ENUM, values: ['moral', 'fisica'] })
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

  @Column({
    type: DataTypes.VIRTUAL,
    get() {
      const firstName = this.getDataValue('firstName'),
        lastName = this.getDataValue('lastName');
      if (!firstName || !lastName) return null;
      return `${firstName} ${lastName}`;
    },
  })
  fullName?: string;

  @Column nickName?: string;

  @Column({ type: DataTypes.ENUM, values: ['male', 'female', 'other'] })
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

  @Column(DataTypes.ARRAY(DataTypes.STRING)) secondaryEmails?: string[];
  @Column(DataTypes.ARRAY(DataTypes.STRING)) phoneNumbers?: string[];
  @Column({
    type: DataTypes.ARRAY(DataTypes.STRING),
    get() {
      return this.dataValues.languages?.map((v: string) => {
        const [lang, proficiency] = v.split(':');
        return { lang, proficiency };
      });
    },
  })
  languages?: string[];
  @Column(DataTypes.ARRAY(DataTypes.STRING)) externalLinks?: string[];

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

  @Column({
    type: DataTypes.VIRTUAL,
    get() {
      return [
        this.dataValues.city,
        this.dataValues.state,
        this.dataValues.country,
        !!this.dataValues.postalCode && 'CP: ' + this.dataValues.postalCode,
      ]
        .filter((v) => !!v)
        .join(', ');
    },
  })
  location?: string;

  @Column university?: string;
  @Column(DataType.TEXT) associations?: string;
  @Column(DataType.TEXT) certifications?: string;

  @IsUrl
  @Column
  profilePictureUrl?: string;

  @IsUrl
  @Column
  headerPictureUrl?: string;

  @IsDate
  @Column
  birthday?: Date;

  @Column({ type: DataTypes.ENUM, values: ['local', 'state', 'national', 'international'] })
  workRadius?: 'local' | 'state' | 'national' | 'international';

  @Column(DataTypes.TSVECTOR) searchString?: string;

  @BelongsToMany(() => Profile, () => ProfileRecommendations, 'profileId', 'recommendedBy')
  recommendations!: Profile[];

  @CreatedAt
  createdAt!: Date;
  @UpdatedAt
  updatedAt!: Date;
  @DeletedAt
  deletedAt!: Date;

  @BeforeUpdate({ name: 'updateVector' })
  static async updateVector(instance: Profile) {
    function addWeightIfExists(v: string | undefined | null, weight: 'A' | 'B' | 'C'): string[] {
      if (!v) return [];
      return v.split(' ').map((i) => i + ':' + weight);
    }
    instance.recommendationsCount = await instance.$count('recommendations');
    instance.searchable =
      !!instance.primaryActivity && !!instance.fullName && !!instance.gender && !!instance.location;
    instance.searchString = instance.sequelize.fn(
      'to_tsvector',
      [
        'spanish',
        instance.dataValues.fullName?.split(' ').map((v: string) => v + ':A'),
        addWeightIfExists(instance.dataValues.primaryActivity, 'A'),
        addWeightIfExists(instance.dataValues.secondaryActivity, 'B'),
        addWeightIfExists(instance.dataValues.thirdActivity, 'B'),
        addWeightIfExists(instance.dataValues.location, 'B'),
        addWeightIfExists(instance.dataValues.certifications, 'C'),
        addWeightIfExists(instance.dataValues.associations, 'C'),
        addWeightIfExists(instance.dataValues.university, 'C'),
      ]
        .flat()
        .join(' ')
    ) as unknown as string;
  }

  toDTO() {
    return ProfileMapper.toDto(this);
  }
}

@Table({ tableName: 'profile_recommendations', modelName: 'ProfileRecommendations' })
export class ProfileRecommendations extends Model {
  @ForeignKey(() => Profile)
  @Column
  profileId!: string;

  @ForeignKey(() => Profile)
  @Column
  recommendedBy!: string;
}
