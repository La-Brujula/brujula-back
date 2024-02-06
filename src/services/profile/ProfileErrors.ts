import { ServiceError } from '@/shared/classes/serviceError';

const ProfileErrors = {
  existingProfile: new ServiceError('PE01', 'Profile already exists', 409),
  profileDoesNotExist: new ServiceError('PE02', 'Profile does not exist', 404),
  alreadyRecommended: new ServiceError('PE03', 'Profile already recommended', 409),
  notRecommended: new ServiceError('PE04', 'Profile is not recommended', 409),
};

export default ProfileErrors;
