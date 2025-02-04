import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { Inject, Service } from 'typedi';
import { JobMapper } from '@/models/jobs/jobsMapper';
import JobsErrors from './JobsErrors';
import Logger from '@/providers/Logger';
import { JobsRepository } from '@/repositories/JobsRepository';
import {
  IJobSearchOptions,
  TJobPosting,
  TJobUpdateRequest,
} from '@/models/jobs/jobs';
import { IPaginationParams } from '@/shared/classes/pagination';
import { ProfileRepository } from '@/repositories/ProfileRepository';
import ProfileErrors from '../profile/ProfileErrors';
import { ProfileMapper } from '@/models/profile/profileMapper';
import { AccountRepository } from '@/repositories/AuthenticationRepository';
import { IAccountDTO } from '@/models/authentication/authentication';

@Service()
export default class JobsService {
  constructor(
    @Inject('JobsRepository')
    private readonly jobsRepository: JobsRepository,
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
    @Inject('AccountRepository')
    private readonly accountRepository: AccountRepository
  ) {}

  public async createJob(newJob: TJobPosting) {
    Logger.verbose('JobService | addJob | Start');
    if (!newJob.requesterId) {
      throw JobsErrors.needVerifiedAccountToCreateJob;
    }
    const profile = await this.profileRepository.findByEmail(
      newJob.requesterId
    );
    if (!profile?.verified) {
      throw JobsErrors.needVerifiedAccountToCreateJob;
    }
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

  public async updateJob(
    jobId: string,
    updatedJob: TJobUpdateRequest,
    requestingUser: IAccountDTO
  ) {
    Logger.verbose('JobService | updateJob | Start');
    Logger.verbose('JobService | updateJob | Checking if Job exists');
    const job = await this.jobsRepository.findById(jobId);
    if (job === null) {
      throw JobsErrors.jobDoesNotExist;
    }

    if (job.job.requesterId !== requestingUser.email) {
      throw JobsErrors.notOwnJob;
    }

    Logger.verbose('JobService | updateJob | Updating Job');
    const UpdatedJob = await this.jobsRepository.update(jobId, {
      ...job,
      ...updatedJob,
    });
    if (!UpdatedJob) {
      throw JobsErrors.couldNotDeleteJob;
    }
    Logger.verbose('JobService | updateJob | Updated Job');
    Logger.verbose('JobService | updateJob | Finished');
    return ServiceResponse.ok(UpdatedJob, 202);
  }

  public async deleteJob(jobId: string, requestingUser: IAccountDTO) {
    Logger.verbose('JobService | deleteJob | Start');
    Logger.verbose('JobService | deleteJob | Checking if Job exists');
    const job = await this.jobsRepository.findById(jobId);
    if (job === null) {
      throw JobsErrors.jobDoesNotExist;
    }

    if (job.job.requesterId !== requestingUser.email) {
      throw JobsErrors.notOwnJob;
    }

    Logger.verbose('JobService | deleteJob | Deleting Job');
    const JobDeleted = await this.jobsRepository.delete(jobId);
    if (!JobDeleted) {
      throw JobsErrors.couldNotDeleteJob;
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
  public async applyToJob(jobId: string, profileId: string, accountId: string) {
    Logger.verbose(`JobService | applyToJob | Started`);

    Logger.verbose('JobService | applyToJob | Verifying profile exists');
    const ProfileRecord = await this.profileRepository.getLean(profileId);
    if (ProfileRecord === null) throw ProfileErrors.profileDoesNotExist;

    Logger.verbose('JobService | applyToJob | Getting opening by id');
    const JobRecord = await this.jobsRepository.findById(jobId);
    if (JobRecord === null) throw JobsErrors.jobDoesNotExist;
    Logger.verbose('JobService | applyToJob | Got opening');

    Logger.verbose('JobService | applyToJob | Checking if own opening');
    if (JobRecord.job.requesterId === accountId)
      throw JobsErrors.cantApplyToOwnOpening;

    Logger.verbose('JobService | applyToJob | Checking if already applied');
    const alreadyApplied = await JobRecord.$has('applicants', profileId);
    if (alreadyApplied === null) throw JobsErrors.openingAlreadyApplied;

    Logger.verbose('JobService | applyToJob | Adding profile as applicant');
    const res = await this.jobsRepository.addApplicantToJob(
      JobRecord.id,
      ProfileRecord.id
    );

    Logger.verbose('JobService | applyToJob | Finished');
    return ServiceResponse.ok(res, 201);
  }
  public async getCreatedJobs(profileId: string) {
    Logger.verbose(`JobService | getCreatedJobs | Started`);

    Logger.verbose('JobService | getCreatedJobs | Verifying profile exists');
    const accountRecord = await this.accountRepository.findByEmail(profileId);
    if (accountRecord === null) throw ProfileErrors.profileDoesNotExist;

    Logger.verbose('JobService | getCreatedJobs | Getting jobs by profile id');
    const { rows: JobRecords, count } =
      await this.jobsRepository.getCreated(profileId);
    if (JobRecords === null) throw JobsErrors.jobDoesNotExist;
    Logger.verbose('JobService | getCreatedJobs | Got openings');

    Logger.verbose('JobService | getCreatedJobs | Finished');
    return ServiceResponse.paginate(
      JobRecords.flatMap((job) =>
        job.openings.map((opening) => {
          opening.job = job;
          return JobMapper.toListItem(opening);
        })
      ),
      count,
      0,
      count
    );
  }

  private async jobExists(jobId: string) {
    return (await this.jobsRepository.findById(jobId)) !== null;
  }
}
