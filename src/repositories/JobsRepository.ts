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
import Job, { JobOpening, JobOpeningsApplicants } from '@/database/schemas/Job';
import {
  IJobSearchOptions,
  TJobOpening,
  TJobPosting,
} from '@/models/jobs/jobs';
import JobsErrors from '@/services/jobs/JobsErrors';
import Profile from '@/database/schemas/Profile';
import Account from '@/database/schemas/Account';

@Service('JobsRepository')
export class JobsRepository {
  declare sequelize: Sequelize;
  declare db: Repository<JobOpening>;
  declare applicantsDb: Repository<JobOpeningsApplicants>;
  declare jobsDb: Repository<Job>;
  declare accountsDb: Repository<Account>;
  declare profilesDb: Repository<Profile>;
  declare jobsInclude: IncludeOptions;
  declare fullInclude: IncludeOptions;

  constructor(@Inject('Database') database: Database) {
    this.jobsDb = database.sequelize.getRepository(Job);
    this.db = database.sequelize.getRepository(JobOpening);
    this.applicantsDb = database.sequelize.getRepository(JobOpeningsApplicants);
    this.sequelize = database.sequelize;
  }

  async getAllUserListings(fieldName: string, transaction?: Transaction) {
    return await this.db.findAll({
      attributes: [[Sequelize.fn('DISTINCT', col(fieldName)), fieldName]],
      order: [[col(fieldName), 'ASC']],
      transaction,
    });
  }

  async getAllValuesForField(fieldName: string, transaction?: Transaction) {
    return await this.db.findAll({
      attributes: [[Sequelize.fn('DISTINCT', col(fieldName)), fieldName]],
      order: [[col(fieldName), 'ASC']],
      transaction,
    });
  }

  async findById(id: string) {
    const applicant = await this.db.findByPk(id, {
      include: [
        {
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
          include: [
            {
              model: this.sequelize.models.Account,
              as: 'requester',
              attributes: ['email', 'ProfileId'],
              include: [
                {
                  model: this.sequelize.models.Profile,
                  as: 'profile',
                  attributes: [
                    'id',
                    'primaryEmail',
                    'type',
                    'fullName',
                    'searchable',
                    'subscriber',
                    'verified',
                    'profilePictureUrl',
                    'location',
                    'nickName',
                    'gender',
                    'primaryActivity',
                    'country',
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return applicant;
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
          `strict_word_similarity('${query}', "JobOpenings"."searchString") * 4`,
          `strict_word_similarity('${query}', CONCAT("description", "notes", "specialRequirements")) * 2`,
        ].join(' + ') +
        ')'
    );
  }

  async find(
    {
      query,
      activity,
      location,
      probono,
      employment,
      requesterId,
    }: IJobSearchOptions,
    { limit = 10, offset = 0 }: IPaginationParams
  ): Promise<[number, JobOpening[]]> {
    const searchQuery = {
      where: {
        [Op.and]: [
          !!requesterId && where('requesterId', '==', requesterId),
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
      include: [
        {
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
          include: [
            {
              model: this.sequelize.models.Account,
              as: 'requester',
              attributes: ['email', 'ProfileId'],
              include: [
                {
                  model: this.sequelize.models.Profile,
                  as: 'profile',
                  attributes: [
                    'id',
                    'primaryEmail',
                    'type',
                    'fullName',
                    'searchable',
                    'subscriber',
                    'verified',
                    'profilePictureUrl',
                    'location',
                    'nickName',
                    'gender',
                    'primaryActivity',
                    'country',
                  ],
                },
              ],
            },
          ],
        },
      ],
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

  async getLean(id: string) {
    const record = await this.db.findByPk(id, {
      attributes: ['id'],
    });
    return record;
  }
  async getCreated(id: string) {
    const record = await this.jobsDb.findAndCountAll({
      where: {
        requesterId: id,
      },
      include: [
        {
          model: this.sequelize.models.JobOpenings,
          as: 'openings',
          attributes: [
            'activity',
            'count',
            'probono',
            'gender',
            'ageRangeMin',
            'ageRangeMax',
            'school',
            'languages',
            'id',
          ],
        },
        {
          model: this.sequelize.models.Account,
          as: 'requester',
          attributes: ['email', 'ProfileId'],
          include: [
            {
              model: this.sequelize.models.Profile,
              as: 'profile',
              attributes: [
                'id',
                'primaryEmail',
                'type',
                'fullName',
                'searchable',
                'subscriber',
                'verified',
                'profilePictureUrl',
                'location',
                'nickName',
                'gender',
                'primaryActivity',
                'country',
              ],
            },
          ],
        },
      ],
    });
    return record;
  }
  async addApplicantToJob(jobOpeningId: string, profileId: string) {
    return await this.applicantsDb.create({
      jobOpeningId: jobOpeningId,
      profileId: profileId,
    });
  }

  async getJobApplicants(id: string, limit: number = 10, offset: number = 0) {
    const applicants = await this.applicantsDb.findAll({
      where: {
        jobOpeningId: id,
      },
      limit,
      offset,
      include: [
        {
          model: this.sequelize.models.Profile,
          as: 'profile',
          attributes: [
            'primaryEmail',
            'fullName',
            'id',
            'type',
            'subscriber',
            'recommendationsCount',
            'nickName',
            'primaryActivity',
            'secondaryActivity',
            'thirdActivity',
            'gender',
            'location',
            'country',
            'profilePictureUrl',
            'headerPictureUrl',
            'headline',
            'verified',
          ],
        },
      ],
    });

    return applicants;
  }
}
