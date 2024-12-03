import { Router } from 'express';
import {
  GetJobRequest,
  JobPostingCreateRequest,
  JobSearchRequest,
} from './jobs.validators';
import Container from 'typedi';
import JobsController from './jobs.controllers';
import { zodValidationHandler } from '@/shared/utils/zodValidationHandler';

const router: Router = Router();

export default (app: Router) => {
  app.use('/jobs', router);

  // Apply the rate limiting middleware to all requests.
  const jobsController = Container.get(JobsController);

  router
    .route('/')
    .get(zodValidationHandler(JobSearchRequest), jobsController.getJobs)
    .post(
      zodValidationHandler(JobPostingCreateRequest),
      jobsController.createJob
    );
  router
    .route('/:id')
    .get(zodValidationHandler(GetJobRequest), jobsController.getJob);
};
