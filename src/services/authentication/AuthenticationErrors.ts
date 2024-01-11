import { ServiceError } from '@/shared/classes/serviceError';

const AuthenticationErrors = {
  existingAccount: new ServiceError('AE01', 'Account already exists', 409),
  wrongCredentials: new ServiceError('AE02', 'Wrong credentials', 401),
  accountDoesNotExist: new ServiceError('AE03', 'Account does not exist', 404),
  notLoggedIn: new ServiceError('AE04', 'Not logged in', 401),
  badToken: new ServiceError('AE05', 'Bad jwt token', 401),
  couldNotDeleteAccount: new ServiceError('AE06', 'Could not delete account', 500),
};

export default AuthenticationErrors;
