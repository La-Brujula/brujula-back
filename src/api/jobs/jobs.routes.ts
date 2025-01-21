import { Router } from 'express';
import {
  GetJobApplicantsRequest,
  GetJobRequest,
  JobPostingCreateRequest,
  JobSearchRequest,
} from './jobs.validators';
import Container from 'typedi';
import JobsController from './jobs.controllers';
import { zodValidationHandler } from '@/shared/utils/zodValidationHandler';
import authenticateRequest from '@/shared/middleware/authenticateRequest';

const router: Router = Router();

export default (app: Router) => {
  app.use('/jobs', router);

  // Apply the rate limiting middleware to all requests.
  const jobsController = Container.get(JobsController);

  router
    .route('/')
    .get(zodValidationHandler(JobSearchRequest), jobsController.getJobs)
    .post(
      authenticateRequest,
      zodValidationHandler(JobPostingCreateRequest),
      jobsController.createJob
    );

  router.get('/me', authenticateRequest, jobsController.getAppliedJobs);

  router
    .route('/:id')
    .get(zodValidationHandler(GetJobRequest), jobsController.getJob);
  router
    .route('/:id/applicants')
    .get(
      zodValidationHandler(GetJobApplicantsRequest),
      jobsController.getJobApplicants
    )
    .post(
      zodValidationHandler(GetJobRequest),
      authenticateRequest,
      jobsController.applyToJob
    );
};
