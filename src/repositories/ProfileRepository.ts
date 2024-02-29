import { Inject, Service } from 'typedi';
import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import Database from '@/database/Database';
import {
  FindAndCountOptions,
  Op,
  Order,
  Sequelize,
  Transaction,
  WhereOptions,
  cast,
  col,
  fn,
  literal,
  where,
} from 'sequelize';
import Profile from '@/database/schemas/Profile';
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import ProfileErrors from '@/services/profile/ProfileErrors';

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

  concatColumns(...columns: string[]) {
    return fn(
      'CONCAT',
      ...columns.flatMap((column) => [' ', cast(col(column), 'text')]).slice(1)
    );
  }

  buildTextSearchQuery(query: string) {
    return fn(
      'GREATEST',
      fn('SIMILARITY', this.concatColumns('firstName', 'lastName'), query),
      fn('SIMILARITY', col('nickName'), query),
      fn('SIMILARITY', this.concatColumns('city', 'state', 'country'), query)
    );
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
          !!query && where(this.buildTextSearchQuery(query), Op.gte, 0.3),
          !!name &&
            where(
              this.concatColumns('firstName', 'lastName'),
              Op.iLike,
              `%${name}%`
            ),
          !!activity && {
            [Op.or]: [
              { primaryActivity: { [Op.iLike]: activity + '%' } },
              {
                secondaryActivity: { [Op.iLike]: activity + '%' },
              },
              { thirdActivity: { [Op.iLike]: activity + '%' } },
            ],
          },
          !!location &&
            where(
              this.concatColumns('city', 'country', 'state'),
              Op.iLike,
              `%${location}%`
            ),
          !!gender && { gender },
          !!remote && { remote },
          !!type && { type },
          !!language &&
            where(
              cast(this.sequelize.col('languages'), 'text'),
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
          !!email &&
            where(
              this.concatColumns('primaryEmail', 'secondaryEmails'),
              Op.iLike,
              '%' + email + '%'
            ),
          ,
        ].filter((v) => v !== false) as WhereOptions<Profile>,
      },
    } as FindAndCountOptions;
    return [
      await this.db.count({
        ...searchQuery,
        attributes: [],
      }),
      await this.db.findAll({
        ...searchQuery,
        order: [
          !!query && [this.buildTextSearchQuery(query), 'DESC'],
          ['subscriber', 'DESC'],
          ['recommendationsCount', 'DESC'],
          !!activity && [
            literal(`CASE
        WHEN "Profile"."primaryActivity" ILIKE ${this.sequelize.escape(activity + '%')} THEN 3
        WHEN "Profile"."secondaryActivity" ILIKE ${this.sequelize.escape(activity + '%')} THEN 2
        WHEN "Profile"."thirdActivity" ILIKE ${this.sequelize.escape(activity + '%')} THEN 1
        ELSE 0
        END`),
            'DESC',
          ],
          ['firstName', 'DESC'],
        ].filter((a) => !!a) as Order,
        limit,
        offset,
      }),
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
