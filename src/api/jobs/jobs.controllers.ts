import { IJobSearchOptions, TJobPosting } from '@/models/jobs/jobs';
import Logger from '@/providers/Logger';
import JobsService from '@/services/jobs/JobsService';
import { IPaginationParams } from '@/shared/classes/pagination';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  public getJobs = handleAsync(async (req: Request, res: Response) => {
    const userInput = req.query as unknown as IJobSearchOptions &
      IPaginationParams;
    Logger.verbose(req.id + ' | ' + 'JobController | GetJobs | Start');
    const jobsSearchResponse = await this.jobsService.getJobs({
      ...userInput,
      userId: req.user.ProfileId,
    });
    Logger.verbose(req.id + ' | ' + 'JobController | GetJobs | End');

    return sendResponse(res, jobsSearchResponse);
  });

  public createJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | CreateJob | Start');
    const userInput: TJobPosting = req.body;
    userInput.requesterId = req.user?.email;
    const jobCreationResponse = await this.jobsService.createJob(userInput);
    Logger.verbose(req.id + ' | ' + 'JobController | CreateJob | End');
    return sendResponse(res, jobCreationResponse);
  });

  public getJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | GetJob | Start');
    const getJobResponse = await this.jobsService.getJob(req.params.id);
    Logger.verbose(req.id + ' | ' + 'JobController | GetJob | End');
    return sendResponse(res, getJobResponse);
  });
  public updateJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | UpdateJob | Start');
    const getJobResponse = await this.jobsService.updateJob(
      req.params.id,
      req.body,
      req.user
    );
    Logger.verbose(req.id + ' | ' + 'JobController | UpdateJob | End');
    return sendResponse(res, getJobResponse);
  });
  public deleteJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteJob | Start');
    const getJobResponse = await this.jobsService.deleteJob(
      req.params.id,
      req.user
    );
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteJob | End');
    return sendResponse(res, getJobResponse);
  });
  public getJobApplicants = handleAsync(async (req: Request, res: Response) => {
    const { limit, offset } = req.query;
    Logger.verbose(req.id + ' | ' + 'JobController | GetJobApplicants | Start');
    const getJobResponse = await this.jobsService.getJobApplicants(
      req.params.id,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    Logger.verbose(req.id + ' | ' + 'JobController | GetJobApplicants | End');
    return sendResponse(res, getJobResponse);
  });
  public applyToJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | ApplyToJob | Start');
    const getJobResponse = await this.jobsService.applyToJob(
      req.params.id,
      req.user.ProfileId,
      req.user.email
    );
    Logger.verbose(req.id + ' | ' + 'JobController | ApplyToJob | End');
    return sendResponse(res, getJobResponse);
  });
  public getCreatedJobs = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | GetCreatedJobs | Start');
    const getJobResponse = await this.jobsService.getCreatedJobs(
      req.user.email
    );
    Logger.verbose(req.id + ' | ' + 'JobController | GetCreatedJobs | End');
    return sendResponse(res, getJobResponse);
  });
}
