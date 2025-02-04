import { ServiceError } from '@/shared/classes/serviceError';

const JobsErrors = {
  jobDoesNotExist: new ServiceError('JE01', 'Job does not exist', 404),
  openingAlreadyApplied: new ServiceError(
    'JE02',
    'Already applied to opening',
    409
  ),
  cantApplyToOwnOpening: new ServiceError(
    'JE03',
    'Cannot apply to own opening',
    400
  ),
  couldNotUpdateJob: new ServiceError('JE04', 'Could not update job', 500),
  couldNotDeleteJob: new ServiceError('JE05', 'Could not delete job', 500),
  needVerifiedAccountToCreateJob: new ServiceError(
    'JE06',
    'You need to verify your account and log in to create a job posting',
    403
  ),
  notOwnJob: new ServiceError(
    'JE07',
    'You can only edit or delete your own job postings',
    403
  ),
};

export default JobsErrors;
