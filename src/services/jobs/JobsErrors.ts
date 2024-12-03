import { ServiceError } from '@/shared/classes/serviceError';

const JobsErrors = {
  existingAccount: new ServiceError('JE01', 'Account already exists', 409),
  wrongCredentials: new ServiceError('JE02', 'Wrong credentials', 401),
  jobDoesNotExist: new ServiceError('JE03', 'Job does not exist', 404),
  notLoggedIn: new ServiceError('JE04', 'Not logged in', 401),
  badToken: new ServiceError('JE05', 'Bad jwt token', 401),
  couldNotDeleteAccount: new ServiceError(
    'JE06',
    'Could not delete account',
    500
  ),
  couldNotChangePassword: new ServiceError(
    'JE07',
    'Could not change password',
    500
  ),
  exceededPasswordResetAttempts: new ServiceError(
    'JE08',
    'Too many password reset attempts',
    403
  ),
  wrongPasswordResetToken: new ServiceError(
    'JE09',
    'Invalid password reset pin',
    400
  ),
  passwordResetTokenExpired: new ServiceError(
    'JE10',
    'Password reset pin is expired',
    400
  ),
  insufficientPermissions: new ServiceError(
    'JE11',
    'Insufficient permissions to complete request',
    403
  ),
  emailVerificationExpired: new ServiceError(
    'JE12',
    'The verifiaction code has expired, please try again.',
    400
  ),
  emailVerificationIncorrect: new ServiceError(
    'JE13',
    'The verifiaction code was incorrect, please try again.',
    401
  ),
  cantVerifyCodeExpiration: new ServiceError(
    'JE14',
    'Could not verify the verification code expiration time. Please start over',
    500
  ),
  verificationCodeNotFound: new ServiceError(
    'JE15',
    'Could not find a pending verification attempt. Please start over',
    404
  ),
};

export default JobsErrors;
