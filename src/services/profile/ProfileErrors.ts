import { ServiceError } from '@/shared/classes/serviceError';

const ProfileErrors = {
  existingProfile: new ServiceError('PE01', 'Profile already exists', 409),
  profileDoesNotExist: new ServiceError('PE02', 'Profile does not exist', 404),
};

export default ProfileErrors;
