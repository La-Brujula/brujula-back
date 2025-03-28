import { Router } from 'express';
import {
  GetJobApplicantsRequest,
  JobIdInParamsRequest,
  JobPostingCreateRequest,
  JobSearchRequest,
  UpdateJobRequest,
} from './jobs.validators';
import Container from 'typedi';
import JobsController from './jobs.controllers';
import { zodValidationHandler } from '@/shared/utils/zodValidationHandler';
import authenticateRequest from '@/shared/middleware/authenticateRequest';

const router: Router = Router();

export default (app: Router) => {
  app.use('/jobs', router);

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

  router.get('/me', authenticateRequest, jobsController.getCreatedJobs);

  router
    .route('/:id')
    .all(authenticateRequest)
    .get(zodValidationHandler(JobIdInParamsRequest), jobsController.getJob)
    .patch(zodValidationHandler(UpdateJobRequest), jobsController.updateJob)
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
