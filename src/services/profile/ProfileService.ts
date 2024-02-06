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

  async getProfileOrThrow(profileId: string) {
    const profile = await this.profileRepository.findById(profileId);
    if (profile === null) {
      throw ProfileErrors.profileDoesNotExist;
    }
    return profile;
  }

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
    const [total_profiles, dbProfiles] = await this.profileRepository.find(parameters, pagination);
    const profiles = dbProfiles.map(ProfileMapper.toDto);
    Logger.debug('ProfileService | Search | Got results');
    return ServiceResponse.paginate(profiles, total_profiles, parameters.offset);
  }

  public async recommend(
    recommendedById: string,
    recommendationId: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    const recommendedProfile = await this.getProfileOrThrow(recommendationId);
    const recommendatorProfile = await this.getProfileOrThrow(recommendedById);

    if (await recommendedProfile.$has('recommendations', recommendatorProfile)) {
      throw ProfileErrors.alreadyRecommended;
    }
    await recommendedProfile.$add('recommendations', recommendatorProfile);
    Logger.debug('ProfileService | GetFullProfile | Finished');
    await recommendedProfile.save();
    return ServiceResponse.ok(recommendedProfile, 201);
  }

  public async revokeRecommendation(
    recommendedById: string,
    recommendationId: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    const recommendedProfile = await this.getProfileOrThrow(recommendationId);
    const recommendatorProfile = await this.getProfileOrThrow(recommendedById);
    if (!(await recommendedProfile.$has('recommendations', recommendatorProfile))) {
      throw ProfileErrors.notRecommended;
    }

    recommendedProfile.$remove('recommendations', recommendatorProfile);
    await recommendedProfile.save();
    Logger.debug('ProfileService | GetFullProfile | Finished');
    return ServiceResponse.ok(recommendedProfile);
  }

  public async getFullProfile(id: string): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');

    const profileDb = await this.profileRepository.findById(id);
    if (profileDb === null) {
      throw ProfileErrors.profileDoesNotExist;
    }

    console.log(await profileDb.$count('recommendations'));

    const profile = ProfileMapper.toProfile(profileDb);
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
