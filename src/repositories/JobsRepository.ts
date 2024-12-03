import { Inject, Service } from 'typedi';
import Database from '@/database/Database';
import {
  FindAndCountOptions,
  IncludeOptions,
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
import { IPaginationParams } from '@/shared/classes/pagination';
import { Repository } from 'sequelize-typescript';
import { Cast, Col, Fn } from 'sequelize/types/utils';
import Job, { JobOpening } from '@/database/schemas/Job';
import {
  IJobSearchOptions,
  TJobOpening,
  TJobPosting,
} from '@/models/jobs/jobs';
import JobsErrors from '@/services/jobs/JobsErrors';
import Account from '@/database/schemas/Account';

@Service('JobsRepository')
export class JobsRepository {
  declare sequelize: Sequelize;
  declare db: Repository<JobOpening>;
  declare jobsDb: Repository<Job>;
  declare accountsDb: Repository<Account>;
  declare openingsInclude: IncludeOptions;
  declare profileInclude: IncludeOptions;
  constructor(@Inject('Database') database: Database) {
    this.jobsDb = database.sequelize.getRepository(Job);
    this.db = database.sequelize.getRepository(JobOpening);
    this.accountsDb = database.sequelize.getRepository(Account);
    this.sequelize = database.sequelize;

    this.openingsInclude = {
      model: this.jobsDb,
      as: 'job',
      attributes: [
        'requesterId',
        'contactStartDate',
        'contactEndDate',
        'contactEmail',
        'whatsapp',
        'phoneNumbers',
        'location',
        'workRadius',
        'specialRequirements',
        'employment',
        'description',
        'jobStartDate',
        'jobEndDate',
        'budgetLow',
        'budgetHigh',
        'benefits',
        'notes',
      ],
    } as IncludeOptions;
    this.profileInclude = {
      model: this.accountsDb,
      as: 'job.requester',
      attributes: ['id', 'email', 'ProfileId'],
    } as IncludeOptions;
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
      include: [this.openingsInclude],
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
        [
          `strict_word_similarity('${query}', "searchString") * 4`,
          `strict_word_similarity('${query}', CONCAT("description", "notes", "specialRequirements")) * 2`,
        ].join(' + ') +
        ')'
    );
  }

  async find(
    { query, activity, location, probono, employment }: IJobSearchOptions,
    { limit = 10, offset = 0 }: IPaginationParams
  ): Promise<[number, JobOpening[]]> {
    const searchQuery = {
      where: {
        [Op.and]: [
          !!query && where(this.buildTextSearchQuery(query), Op.gte, 0.9),
          !!activity && {
            openings: {
              [Op.any]: { activity: { [Op.iLike]: activity + '%' } },
            },
          },
          !!location &&
            where(
              this.concatColumns('city', 'country', 'state'),
              Op.iLike,
              `%${location}%`
            ),
          !!employment && { employment },
          !!probono && { probono },
        ].filter((v) => v !== false) as WhereOptions<Job>,
      },
    } as FindAndCountOptions<JobOpening>;
    const { count, rows } = await this.db.findAndCountAll({
      ...searchQuery,
      order: [
        !!query && [this.buildTextSearchQuery(query), 'DESC'],
        !!activity && [
          literal(`CASE
      WHEN "activity" ILIKE ${this.sequelize.escape(activity + '%')} THEN 1
      ELSE 0
      END`),
          'DESC',
        ],
        ['createdAt', 'DESC'],
      ].filter((a) => !!a) as Order,
      limit,
      offset,
      include: this.openingsInclude,
      nest: true,
    });
    return [count, rows];
  }

  async create(
    userInput: TJobPosting,
    transaction?: Transaction
  ): Promise<JobOpening[]> {
    const jobPosting = await this.jobsDb.create(userInput, { transaction });
    const jobOpenings = await Promise.all(
      userInput.openings.map((opening) =>
        this.db.create({ ...opening, jobId: jobPosting.id })
      )
    );
    return jobOpenings;
  }

  async delete(id: string, transaction?: Transaction) {
    return (
      (await this.db.destroy({ where: { id }, transaction, force: true })) > 0
    );
  }

  async update(id: string, values: TJobOpening, transaction?: Transaction) {
    const record = await this.db.findByPk(id, { transaction });
    if (!record) throw JobsErrors.jobDoesNotExist;
    await record.update(values, { transaction });
    record.save();
    return record;
  }
}
