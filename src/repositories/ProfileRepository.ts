import { Inject, Service } from 'typedi';
import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import Database from '@/database/Database';
import { Op, Order, Sequelize, Transaction, WhereOptions, cast, col, where } from 'sequelize';
import Profile from '@/database/schemas/Profile';
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import ProfileErrors from '@/services/profile/ProfileErrors';

@Service('ProfileRepository')
export class ProfileRepository {
  declare db: Repository<Profile>;
  declare recommendationsInclude: {};
  constructor(@Inject('Database') database: Database) {
    this.db = database.sequelize.getRepository(Profile);

    this.recommendationsInclude = {
      model: this.db,
      as: 'recommendations',
      attributes: [
        'id',
        'primaryEmail',
        'fullName',
        'firstName',
        'lastName',
        'type',
        'searchable',
        'subscriber',
        'recommendationsCount',
      ],
    };
  }

  async findByEmail(email: string, transaction?: Transaction) {
    return await this.db.findOne({
      where: { primaryEmail: email },
      include: [this.recommendationsInclude],
      transaction: transaction,
    });
  }

  async findById(id: string, transaction?: Transaction) {
    return await this.db.findByPk(id, {
      include: [this.recommendationsInclude],
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
      email,
    }: IProfileSearchQuery,
    { limit = 10, offset = 0 }: IPaginationParams
  ): Promise<[number, Profile[]]> {
    const searchQuery = {
      where: {
        [Op.and]: [
          // {
          //   searchable: true,
          // },
          query !== undefined && {
            searchString: { [Op.match]: Sequelize.fn('to_tsquery', 'spanish', query) },
          },
          name !== undefined && {
            [Op.or]: [
              {
                firstName: {
                  [Op.iLike]: '%' + name + '%',
                },
              },
              {
                lastName: {
                  [Op.iLike]: '%' + name + '%',
                },
              },
            ],
          },
          activity !== undefined && {
            [Op.or]: [
              { primaryActivity: activity },
              { secondaryActivity: activity },
              { thirdActivity: activity },
            ],
          },
          location !== undefined && {
            [Op.or]: [
              {
                city: {
                  [Op.iLike]: '%' + location + '%',
                },
              },
              {
                country: {
                  [Op.iLike]: '%' + location + '%',
                },
              },
              {
                state: {
                  [Op.iLike]: '%' + location + '%',
                },
              },
              {
                postalCode: {
                  [Op.iLike]: '%' + location + '%',
                },
              },
            ],
          },
          gender !== undefined && { gender },
          remote !== undefined && { remote },
          type !== undefined && { type },
          language !== undefined &&
            where(cast(col('"Profile"."languages"'), 'text'), Op.iLike, '%' + language + '%'),
          university !== undefined && {
            university: {
              [Op.iLike]: '%' + university + '%',
            },
          },
          probono !== undefined && { probono },
          associations !== undefined && {
            associations: {
              [Op.iLike]: '%' + associations + '%',
            },
          },
          certifications !== undefined && {
            certifications: {
              [Op.iLike]: '%' + certifications + '%',
            },
          },
          email !== undefined && {
            [Op.or]: [
              {
                primaryEmail: {
                  [Op.iLike]: '%' + email + '%',
                },
              },
              where(cast(col('"Profile"."secondayEmail"'), 'text'), Op.iLike, '%' + email + '%'),
            ],
          },
        ].filter((v) => v !== false) as WhereOptions<Profile>,
      },
      include: [this.recommendationsInclude],
      order: [
        ['subscriber', 'DESC'],
        ['recommendationsCount', 'DESC'],
        ['firstName', 'DESC'],
      ] as Order,
    };
    return [
      await this.db.count({ ...searchQuery, attributes: [] }),
      await this.db.findAll({ ...searchQuery, limit, offset }),
    ];
  }

  async create(userInput: IProfileCreationQuery, transaction?: Transaction): Promise<Profile> {
    const newProfile = {
      primaryEmail: userInput.email,
      type: userInput.type,
    };
    return await this.db.create(newProfile, { transaction });
  }

  async delete(id: string, transaction?: Transaction) {
    return (await this.db.destroy({ where: { id }, transaction })) > 0;
  }

  async update(
    id: string,
    values: IExtraProfileInformation & ISearchableProfile,
    transaction?: Transaction
  ) {
    const record = await this.db.findByPk(id, { transaction });
    if (!record) throw ProfileErrors.profileDoesNotExist;
    await record.update(values, { transaction });
    return record;
  }
}
