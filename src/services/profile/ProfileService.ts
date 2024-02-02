import {
  IProfileSearchQuery,
  IProfileCreationQuery,
  IProfileDTO,
  ISearchableProfile,
  IExtraProfileInformation,
  IProfile,
} from '@/models/profile/profile';
import { ProfileRepository } from '@/repositories/ProfileRepository';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { Inject, Service } from 'typedi';
import { ProfileMapper } from '@/models/profile/profileMapper';
import ProfileErrors from './ProfileErrors';
import Logger from '@/providers/Logger';
import { IPaginationParams } from '@/shared/classes/pagination';

@Service('ProfileService')
export default class ProfileService {
  declare tokenSecret: string;
  constructor(@Inject('ProfileRepository') private readonly profileRepository: ProfileRepository) {}

  public async createProfile(
    newAccount: IProfileCreationQuery
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | createProfile | Start');
    Logger.debug('ProfileService | createProfile | Checking if profile already exists');
    if (await this.profileExists(newAccount.email)) {
      throw ProfileErrors.existingProfile;
    }

    Logger.debug('ProfileService | createProfile | Creating profile');
    const profileRecord = await this.profileRepository.create(newAccount);
    Logger.debug('ProfileService | createProfile | Created profile');

    const profile = ProfileMapper.toDto(profileRecord);
    Logger.debug('ProfileService | createProfile | Finished');
    return ServiceResponse.ok(profile);
  }

  public async search(
    parameters: IProfileSearchQuery & IPaginationParams
  ): Promise<ServiceResponse<IProfileDTO[]>> {
    const pagination: IPaginationParams = {
      limit: parameters.limit,
      offset: parameters.offset,
    };
    const [total_profiles, profiles] = await this.profileRepository.find(parameters, pagination);
    Logger.debug('ProfileService | Search | Got results');
    return ServiceResponse.paginate(profiles, total_profiles, parameters.offset);
  }

  public async getFullProfile(id: string): Promise<ServiceResponse<boolean>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    const profile = await this.profileRepository.findById(id);
    if (profile === null) {
      throw ProfileErrors.profileDoesNotExist;
    }
    Logger.debug('ProfileService | GetFullProfile | Finished');
    return ServiceResponse.ok(profile);
  }

  public async updateProfile(
    id: string,
    params: ISearchableProfile & IExtraProfileInformation
  ): Promise<ServiceResponse<IProfile>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    const profile = await this.profileRepository.update(id, params);
    if (profile === null) {
      throw ProfileErrors.profileDoesNotExist;
    }
    Logger.debug('ProfileService | GetFullProfile | Finished');
    return ServiceResponse.ok(profile);
  }

  private async profileExists(id: string) {
    return !!(await this.profileRepository.findById(id));
  }
}
