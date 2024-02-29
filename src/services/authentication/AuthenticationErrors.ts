import { ServiceError } from '@/shared/classes/serviceError';

const AuthenticationErrors = {
  existingAccount: new ServiceError('AE01', 'Account already exists', 409),
  wrongCredentials: new ServiceError('AE02', 'Wrong credentials', 401),
  accountDoesNotExist: new ServiceError('AE03', 'Account does not exist', 404),
  notLoggedIn: new ServiceError('AE04', 'Not logged in', 401),
  badToken: new ServiceError('AE05', 'Bad jwt token', 401),
  couldNotDeleteAccount: new ServiceError(
    'AE06',
    'Could not delete account',
    500
  ),
  couldNotChangePassword: new ServiceError(
    'AE07',
    'Could not change password',
    500
  ),
  exceededPasswordResetAttempts: new ServiceError(
    'AE08',
    'Too many password reset attempts',
    403
  ),
  wrongPasswordResetToken: new ServiceError(
    'AE09',
    'Invalid password reset pin',
    400
  ),
  passwordResetTokenExpired: new ServiceError(
    'AE10',
    'Password reset pin is expired',
    400
  ),
  insufficientPermissions: new ServiceError(
    'AE11',
    'Insufficient permissions to complete request',
    403
  ),
};

export default AuthenticationErrors;
