import { ServiceError } from '@/shared/classes/serviceError';

const AuthenticationErrors = {
  existingAccount: new ServiceError('AE01', 'Account already exists with the data provided', 409),
  wrongCredentials: new ServiceError('AE02', 'Wrong credentials', 401),
  accountDoesNotExist: new ServiceError('AE03', 'Account does not exist', 404),
};

export default AuthenticationErrors;
