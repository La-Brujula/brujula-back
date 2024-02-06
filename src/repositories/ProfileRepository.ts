import { Inject, Service } from 'typedi';
import {
  IExtraProfileInformation,
  IProfile,
  IProfileCreationQuery,
  IProfileDTO,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import Database from '@/database/Database';
import { Op, Order, Sequelize, WhereOptions } from 'sequelize';
import Profile from '@/database/schemas/Profile';
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import ProfileErrors from '@/services/profile/ProfileErrors';

@Service('ProfileRepository')
export class ProfileRepository {
  declare db: Repository<Profile>;
  constructor(@Inject('Database') database: Database) {
    this.db = database.sequelize.getRepository(Profile);
  }

  async findById(id: string) {
    return await this.db.findByPk(id, {
      include: [
        {
          model: this.db,
          as: 'recommendations',
          attributes: [
            'id',
            'primaryEmail',
            'fullName',
            'type',
            'searchable',
            'subscriber',
            'recommendationsCount',
          ],
        },
      ],
    });
  }

  async find(
    {
      query,
      name,
      activity,
      location,
      gender,
      remote,
      type,
      language,
      university,
      probono,
      associations,
      certifications,
    }: IProfileSearchQuery,
    { limit = 10, offset = 0 }: IPaginationParams
  ): Promise<[number, IProfileDTO[]]> {
    const searchQuery = {
      where: {
        [Op.and]: [
          {
            searchable: true,
          },
          !!query && {
            searchString: { [Op.match]: Sequelize.fn('to_tsquery', 'spanish', name) },
          },
          !!name && {
            fullName: {
              [Op.match]: Sequelize.fn('to_tsquery', name),
            },
          },
          !!activity && {
            [Op.or]: [
              { primaryActivity: activity },
              { secondaryActivity: activity },
              { thirdActivity: activity },
            ],
          },
          !!location && {
            location: {
              [Op.match]: Sequelize.fn('to_tsquery', location),
            },
          },
          !!gender && { gender: gender },
          !!remote && { remote },
          !!type && { type },
          !!language && {
            language: {
              [Op.contains]: language,
            },
          },
          !!university && {
            university: {
              [Op.match]: Sequelize.fn('to_tsquery', university),
            },
          },
          !!probono && { probono },
          !!associations && {
            associations: {
              [Op.match]: Sequelize.fn('to_tsquery', associations),
            },
          },
          !!certifications && {
            certifications: {
              [Op.match]: Sequelize.fn('to_tsquery', certifications),
            },
          },
        ].filter((v) => !!v) as WhereOptions<Profile>,
      },
      include: [
        {
          association: 'recommendations',
          through: {
            attributes: ['id', 'primaryEmail', 'fullName'],
          },
        },
      ],
      order: [
        ['subscriber', 'DESC'],
        ['recommendationsCount', 'DESC'],
        ['firstName', 'DESC'],
      ] as Order,
      attributes: [
        'id',
        'primaryEmail',
        'type',
        'subscriber',
        'firstName',
        'lastName',
        'nickName',
        'primaryActivity',
        'recommendationsCount',
        'secondaryActivity',
        'thirdActivity',
        'gender',
        'city',
        'state',
        'country',
        'postalCode',
        'profilePictureUrl',
      ],
    };
    return [
      await this.db.count({ ...searchQuery, attributes: [] }),
      await this.db.findAll({ ...searchQuery, limit, offset }),
    ];
  }

  async create(userInput: IProfileCreationQuery): Promise<Profile> {
    const newProfile = {
      primaryEmail: userInput.email,
      type: userInput.type,
    };
    return await this.db.create(newProfile);
  }

  async delete(id: string) {
    return (await this.db.destroy({ where: { id } })) > 0;
  }

  async update(id: string, values: IExtraProfileInformation & ISearchableProfile) {
    const record = await this.db.findByPk(id);
    if (!record) throw ProfileErrors.profileDoesNotExist;
    await record.update(values);
    return record;
  }
}
