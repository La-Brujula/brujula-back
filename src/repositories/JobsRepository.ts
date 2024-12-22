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

@Service()
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

    console.log(this.jobsDb.associations);
  }

  async getAllValuesForField(fieldName: string, transaction?: Transaction) {
    return await this.db.findAll({
      attributes: [[Sequelize.fn('DISTINCT', col(fieldName)), fieldName]],
      order: [[col(fieldName), 'ASC']],
      transaction,
    });
  }

  async findById(id: string, transaction?: Transaction) {
    const [applicant, _] = (await this.sequelize.query(
      `SELECT
        jo."id" as "opening.id",
        jo."jobId" as "opening.jobId",
        jo."activity" as "opening.activity",
        jo."count" as "opening.count",
        jo."probono" as "opening.probono",
        jo."gender" as "opening.gender",
        jo."ageRangeMin" as "opening.ageRangeMin",
        jo."ageRangeMax" as "opening.ageRangeMax",
        jo."languages" as "opening.languages",
        jo."school" as "opening.school",
        jo."searchString" as "opening.searchString",
        jo."createdAt" as "opening.createdAt",
        jo."updatedAt" as "opening.updatedAt",
        j."requesterId" as "job.requesterId",
        j."contactStartDate" as "job.contactStartDate",
        j."contactEndDate" as "job.contactEndDate",
        j."contactEmail" as "job.contactEmail",
        j."whatsapp" as "job.whatsapp",
        j."phoneNumbers" as "job.phoneNumbers",
        j."location" as "job.location",
        j."workRadius" as "job.workRadius",
        j."specialRequirements" as "job.specialRequirements",
        j."employment" as "job.employment",
        j."description" as "job.description",
        j."jobStartDate" as "job.jobStartDate",
        j."jobEndDate" as "job.jobEndDate",
        j."budgetLow" as "job.budgetLow",
        j."budgetHigh" as "job.budgetHigh",
        j."benefits" as "job.benefits",
        j."notes" as "job.notes",
        r."id" as "requester.id",
        r."primaryEmail" as "requester.primaryEmail",
        r."type" as "requester.type",
        r."searchable" as "requester.searchable",
        r."subscriber" as "requester.subscriber",
        r."recommendationsCount" as "requester.recommendationsCount",
        r."firstName" as "requester.firstName",
        r."lastName" as "requester.lastName",
        r."verified" as "requester.verified",
        r."profilePictureUrl" as "requester.profilePictureUrl",
        r."nickName" as "requester.nickName"
      FROM "job_openings" jo
      JOIN "jobs" j ON j."id" = jo."jobId"
      JOIN "accounts" a ON j."requesterId" = a."email"
      JOIN "profiles" r ON a."ProfileId" = r."id"
      WHERE jo."id" = :id;
      `,
      { replacements: { id }, nest: true }
    )) as unknown as [
      {
        opening: {
          id: string;
          jobId: string;
          activity: string;
          count: number;
          probono: boolean;
          gender: 'male' | 'female' | 'other';
          ageRangeMin: number;
          ageRangeMax: number;
          languages: string[];
          school: string;
          searchString: string;
          createdAt: Date;
          updatedAt: Date;
        };
        job: {
          requesterId: string;
          contactStartDate: Date;
          contactEndDate: Date;
          contactEmail: string;
          whatsapp: string;
          phoneNumbers: string[];
          location: string;
          workRadius: string;
          specialRequirements: string;
          employment: string;
          description: string;
          jobStartDate: Date;
          jobEndDate?: Date;
          budgetLow?: number;
          budgetHigh?: number;
          benefits: string;
          notes: string;
        };
        requester: {
          id: string;
          primaryEmail: string;
          type: 'fisica' | 'moral';
          searchable: boolean;
          subscriber: boolean;
          recommendationsCount: number;
          firstName: string;
          lastName: string;
          verified: boolean;
          profilePictureUrl?: string;
          nickName: string;
        };
      },
      any,
    ];

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
                    'recommendationsCount',
                    'verified',
                    'profilePictureUrl',
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
