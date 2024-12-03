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
    const jobsSearchResponse = await this.jobsService.getJobs(userInput);
    Logger.verbose(req.id + ' | ' + 'JobController | GetJobs | End');

    return sendResponse(res, jobsSearchResponse);
  });

  public createJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | CreateJob | Start');
    const userInput: TJobPosting = req.body;
    userInput.requesterId = req.user?.email || 'dpalme@me.com';
    const jobCreationResponse = await this.jobsService.createJob(userInput);
    Logger.verbose(req.id + ' | ' + 'JobController | CreateJob | End');
    return sendResponse(res, jobCreationResponse);
  });

  public getJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteAccount | Start');
    const getJobResponse = await this.jobsService.getJob(req.params.id);
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteAccount | End');
    return sendResponse(res, getJobResponse);
  });
  public applyToJob = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteAccount | Start');
    const getJobResponse = await this.jobsService.getJob(req.params.id);
    Logger.verbose(req.id + ' | ' + 'JobController | DeleteAccount | End');
    return sendResponse(res, getJobResponse);
  });
}
