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
import Profile, { ProfileRecommendations } from '@/database/schemas/Profile';
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import ProfileErrors from '@/services/profile/ProfileErrors';
import { Cast, Col, Fn } from 'sequelize/types/utils';

@Service('ProfileRepository')
export class ProfileRepository {
  declare sequelize: Sequelize;
  declare db: Repository<Profile>;
  declare recommendationsDb: Repository<ProfileRecommendations>;
  declare recommendationsInclude: {};
  constructor(@Inject('Database') database: Database) {
    this.db = database.sequelize.getRepository(Profile);
    this.recommendationsDb = database.sequelize.getRepository(
      ProfileRecommendations
    );
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

  async recommendationExists(
    recommendedId: string,
    recommendedById: string,
    transaction?: Transaction
  ) {
    return !!(await this.recommendationsDb.findOne({
      where: {
        [Op.and]: [
          {
            profileId: recommendedId,
          },
          {
            recommendedBy: recommendedById,
          },
        ],
      },
      attributes: ['createdAt'],
      transaction,
    }));
  }
  async recommend(
    recommendedId: string,
    recommendedById: string,
    transaction?: Transaction
  ) {
    return await this.recommendationsDb.create(
      {
        profileId: recommendedId,
        recommendedBy: recommendedById,
      },
      {
        transaction,
      }
    );
  }
  async removeRecommendation(
    recommendedId: string,
    recommendedById: string,
    transaction?: Transaction
  ) {
    return await this.recommendationsDb.destroy({
      where: {
        profileId: recommendedId,
        recommendedBy: recommendedById,
      },
      transaction,
    });
  }

  async findByEmail(email: string, transaction?: Transaction) {
    return await this.db.findOne({
      where: { primaryEmail: email },
      include: [this.recommendationsInclude],
      transaction: transaction,
    });
  }

  async getAllValuesForField(fieldName: string, transaction?: Transaction) {
    return await this.db.findAll({
      attributes: [[Sequelize.fn('DISTINCT', col(fieldName)), fieldName]],
      order: [[col(fieldName), 'ASC']],
      transaction,
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

  dmetaphone(text: string | Fn | Col | Cast) {
    return fn('DMETAPHONE', text);
  }

  buildTextSearchQuery(query: string) {
    return literal(
      '(' +
        query
          .split(' ')
          .flatMap((word) => [
            `word_similarity('${word}', "searchString") * 8`,
            `strict_word_similarity('${word}', CONCAT("city", "state", "country", "postalCode")) * 2`,
          ])
          .join(' + ') +
        ')'
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
      country,
    }: IProfileSearchQuery,
    { limit = 10, offset = 0 }: IPaginationParams
  ): Promise<[number, Profile[]]> {
    const searchQuery = {
      where: {
        [Op.and]: [
          !!country && { country },
          !email && {
            searchable: true,
          },
          !!query && where(this.buildTextSearchQuery(query), Op.gte, 8.0),
          !!name &&
            where(
              fn(
                'WORD_SIMILARITY',
                name,
                this.concatColumns('firstName', 'lastName', 'nickName')
              ),
              Op.gte,
              0.5
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
    const queryRes = await this.db.findAndCountAll({
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
    });
    return [queryRes.count, queryRes.rows];
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
    return (
      (await this.db.destroy({ where: { id }, transaction, force: true })) > 0
    );
  }

  async update(
    id: string,
    values: IExtraProfileInformation & ISearchableProfile,
    transaction?: Transaction
  ) {
    const record = await this.db.findByPk(id, { transaction });
    if (!record) throw ProfileErrors.profileDoesNotExist;
    await record.update(values, { transaction });
    record.save();
    return record;
  }
}
