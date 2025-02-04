import { Router } from 'express';
import {
  GetJobApplicantsRequest,
  JobIdInParamsRequest,
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
    .get(
      authenticateRequest,
      zodValidationHandler(JobSearchRequest),
      jobsController.getJobs
    )
    .post(
      authenticateRequest,
      zodValidationHandler(JobPostingCreateRequest),
      jobsController.createJob
    );

  router.get('/me', authenticateRequest, jobsController.getAppliedJobs);

  router
    .route('/:id')
    .all(authenticateRequest)
    .get(zodValidationHandler(JobIdInParamsRequest), jobsController.getJob)
    .patch(zodValidationHandler(JobIdInParamsRequest), jobsController.updateJob)
    .delete(
      zodValidationHandler(JobIdInParamsRequest),
      jobsController.deleteJob
    );
  router
    .route('/:id/applicants')
    .get(
      zodValidationHandler(GetJobApplicantsRequest),
      jobsController.getJobApplicants
    )
    .post(
      zodValidationHandler(JobIdInParamsRequest),
      authenticateRequest,
      jobsController.applyToJob
    );
};
