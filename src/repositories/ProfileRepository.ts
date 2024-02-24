import { Inject, Service } from 'typedi';
import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import Database from '@/database/Database';
import {
  Op,
  Order,
  QueryTypes,
  Sequelize,
  Transaction,
  WhereOptions,
  cast,
  col,
  where,
} from 'sequelize';
import Profile from '@/database/schemas/Profile';
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import ProfileErrors from '@/services/profile/ProfileErrors';
import internal from 'stream';

@Service('ProfileRepository')
export class ProfileRepository {
  declare sequelize: Sequelize;
  declare db: Repository<Profile>;
  declare recommendationsInclude: {};
  constructor(@Inject('Database') database: Database) {
    this.db = database.sequelize.getRepository(Profile);
    this.sequelize = database.sequelize;

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
      transaction,
    });
  }

  async textSearch(query: string, limit: number = 10, offset: number = 0) {
    const greatestStatement = `GREATEST(${(
      [
        ['firstName', true],
        ['lastName', true],
        ['nickName', true],
        ['primaryEmail'],
        ['secondaryEmails'],
        ['phoneNumbers'],
        ['primaryActivity'],
        ['secondaryActivity'],
        ['thirdActivity'],
        ['city', true],
        ['country'],
        ['postalCode'],
        ['certifications'],
        ['associations'],
        ['university'],
      ] as [string, boolean | undefined][]
    ).map(([field, dmeta]) =>
      [
        'SIMILARITY(',
        `${dmeta ? 'DMETAPHONE(' : ''}`,
        'CAST("Profile"."' + field + '" AS TEXT)',
        `${dmeta ? ')' : ''}`,
        ',',
        `${dmeta ? 'DMETAPHONE(' : ''}`,
        ':query',
        `${dmeta ? ')' : ''}`,
        ')',
      ].join('')
    )})`;

    return [
      0,
      await this.sequelize.query(
        `SELECT "Profile".*
      FROM
        profiles AS "Profile"
      WHERE
      ${greatestStatement} > 0.4
      ORDER BY
      ${greatestStatement} DESC
      LIMIT :limit
      OFFSET :offset`,
        {
          replacements: { query, limit, offset },
          type: QueryTypes.SELECT,
        }
      ),
    ] as [number, Profile[]];
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
          {
            searchable: true,
          },
          !!query && {
            [Op.gte]: [Sequelize.fn('GREATEST'), 0.4],
          },
          !!name && {
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
          !!activity && {
            [Op.or]: [
              { primaryActivity: { [Op.like]: activity + '%' } },
              {
                secondaryActivity: { [Op.like]: activity + '%' },
              },
              { thirdActivity: { [Op.like]: activity + '%' } },
            ],
          },
          !!location && {
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
          !!gender && { gender },
          !!remote && { remote },
          !!type && { type },
          !!language &&
            where(
              cast(col('"Profile"."languages"'), 'text'),
              Op.iLike,
              '%' + language + '%'
            ),
          !!university && {
            university: {
              [Op.iLike]: '%' + university + '%',
            },
          },
          !!probono && { probono },
          !!associations && {
            associations: {
              [Op.iLike]: '%' + associations + '%',
            },
          },
          !!certifications && {
            certifications: {
              [Op.iLike]: '%' + certifications + '%',
            },
          },
          !!email && {
            [Op.or]: [
              {
                primaryEmail: {
                  [Op.iLike]: '%' + email + '%',
                },
              },
              where(
                cast(col('"Profile"."secondaryEmails"'), 'text'),
                Op.iLike,
                '%' + email + '%'
              ),
            ],
          },
        ].filter((v) => v !== false) as WhereOptions<Profile>,
      },
      include: [this.recommendationsInclude],
      order: [
        [
          Sequelize.fn(
            'ts_rank',
            '"Profile"."searchString"',
            Sequelize.fn('websearch_to_tsquery', 'spanish', query)
          ),
          'DESC',
        ],
        ['subscriber', 'DESC'],
        ['recommendationsCount', 'DESC'],
        ['firstName', 'DESC'],
      ].filter((a) => !!a) as Order,
    };
    return [
      await this.db.count({ ...searchQuery, attributes: [] }),
      await this.db.findAll({ ...searchQuery, limit, offset }),
    ];
  }

  async create(
    userInput: IProfileCreationQuery,
    transaction?: Transaction
  ): Promise<Profile> {
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
