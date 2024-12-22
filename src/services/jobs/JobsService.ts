import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { Inject, Service } from 'typedi';
import { JobMapper } from '@/models/jobs/jobsMapper';
import JobsErrors from './JobsErrors';
import Logger from '@/providers/Logger';
import { JobsRepository } from '@/repositories/JobsRepository';
import { IJobSearchOptions, TJobPosting } from '@/models/jobs/jobs';
import { IPaginationParams } from '@/shared/classes/pagination';
import { ProfileRepository } from '@/repositories/ProfileRepository';
import ProfileErrors from '../profile/ProfileErrors';
import { ProfileMapper } from '@/models/profile/profileMapper';

@Service()
export default class JobsService {
  constructor(
    @Inject('JobsRepository')
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
    private readonly jobsRepository: JobsRepository
  ) {}

  public async createJob(newJob: TJobPosting) {
    Logger.verbose('JobService | addJob | Start');

    const jobOpenings = await this.jobsRepository.create(newJob);

    Logger.verbose('JobService | addJob | Finished');
    return ServiceResponse.ok(jobOpenings);
  }

  public async getJobs(params: IJobSearchOptions & IPaginationParams) {
    const pagination: IPaginationParams = {
      limit: params.limit,
      offset: params.offset,
    };
    const [total_jobs, jobs] = await this.jobsRepository.find(
      params,
      pagination
    );
    const profiles = JobMapper.toList(jobs);
    Logger.verbose('ProfileService | Search | Got results');
    return ServiceResponse.paginate(
      profiles,
      total_jobs,
      params.offset,
      params.limit
    );
  }

  public async deleteJob(jobId: string) {
    Logger.verbose('JobService | deleteJob | Start');
    Logger.verbose('JobService | deleteJob | Checking if Job exists');
    if (!(await this.jobExists(jobId))) {
      throw JobsErrors.jobDoesNotExist;
    }

    Logger.verbose('JobService | deleteJob | Deleting Job');
    const JobDeleted = await this.jobsRepository.delete(jobId);
    if (!JobDeleted) {
      throw JobsErrors.couldNotDeleteAccount;
    }
    Logger.verbose('JobService | deleteJob | Deleted Job');
    Logger.verbose('JobService | deleteJob | Finished');
    return new ServiceResponse(JobDeleted, 202);
  }

  public async getJob(jobId: string) {
    Logger.verbose(`JobService | getJob | Started`);
    Logger.verbose('JobService | getJob | Getting the user by email');
    const JobRecord = await this.jobsRepository.findById(jobId);
    if (JobRecord === null) {
      throw JobsErrors.jobDoesNotExist;
    }
    Logger.verbose('JobService | getJob | Got a job');
    const jobDTO = JobMapper.buildDto(JobRecord);
    Logger.verbose('JobService | getJob | Finished');
    return ServiceResponse.ok(jobDTO);
  }
  public async getJobApplicants(jobId: string, limit: number, offset: number) {
    Logger.verbose(`JobService | getJobApplicants | Started`);
    Logger.verbose('JobService | getJobApplicants | Getting the job by id');
    const applicants = await this.jobsRepository.getJobApplicants(
      jobId,
      limit,
      offset
    );

    Logger.verbose('JobService | getJobApplicants | Got applicants');
    const profiles = applicants.map((a) => ProfileMapper.toDto(a.profile));
    Logger.verbose('JobService | getJobApplicants | Finished');
    return ServiceResponse.ok(profiles);
  }
  public async applyToJob(jobId: string, profileId: string) {
    Logger.verbose(`JobService | applyToJob | Started`);

    Logger.verbose('JobService | applyToJob | Verifying profile exists');
    const ProfileRecord = await this.profileRepository.findById(profileId);
    if (ProfileRecord === null) throw ProfileErrors.profileDoesNotExist;

    Logger.verbose('JobService | applyToJob | Getting opening by id');
    const JobRecord = await this.jobsRepository.getLean(jobId);
    if (JobRecord === null) throw JobsErrors.jobDoesNotExist;
    Logger.verbose('JobService | applyToJob | Got opening');

    Logger.verbose('JobService | applyToJob | Checking if already applied');
    const alreadyApplied = await JobRecord.$has('applicants', profileId);
    if (alreadyApplied === null) throw JobsErrors.openingAlreadyApplied;

    Logger.verbose('JobService | applyToJob | Adding profile as applicant');
    await JobRecord.$add('applicants', profileId);

    Logger.verbose('JobService | applyToJob | Finished');
    return ServiceResponse.ok(undefined, 201);
  }

  private async jobExists(jobId: string) {
    return (await this.jobsRepository.findById(jobId)) !== null;
  }
}
