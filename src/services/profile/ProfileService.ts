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
import Database from '@/database/Database';

@Service('ProfileService')
export default class ProfileService {
  declare tokenSecret: string;
  constructor(
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
    @Inject('Database') private readonly database: Database
  ) {}

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
    return this.database.sequelize.transaction(async (transaction) => {
      Logger.debug(
        'ProfileService | createProfile | Checking if profile already exists'
      );
      if (await this.profileExistsByEmail(newAccount.email)) {
        throw ProfileErrors.existingProfile;
      }

      Logger.debug('ProfileService | createProfile | Creating profile');
      const profileRecord = await this.profileRepository.create(
        newAccount,
        transaction
      );
      Logger.debug('ProfileService | createProfile | Created profile');

      const profile = ProfileMapper.toDto(profileRecord);
      Logger.debug('ProfileService | createProfile | Finished');
      return ServiceResponse.ok(profile);
    });
  }

  public async search(
    parameters: IProfileSearchQuery & IPaginationParams
  ): Promise<ServiceResponse<IProfileDTO[]>> {
    const pagination: IPaginationParams = {
      limit: parameters.limit,
      offset: parameters.offset,
    };
    const [total_profiles, dbProfiles] =
      parameters.query !== undefined
        ? await this.profileRepository.textSearch(
            parameters.query,
            pagination.limit,
            pagination.offset
          )
        : await this.profileRepository.find(parameters, pagination);
    const profiles = dbProfiles.map(ProfileMapper.toProfile);
    Logger.debug('ProfileService | Search | Got results');
    return ServiceResponse.paginate(
      profiles,
      total_profiles,
      parameters.offset
    );
  }

  public async recommend(
    recommendedById: string,
    recommendationId: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    return this.database.sequelize.transaction(async (transaction) => {
      const recommendedProfile = await this.getProfileOrThrow(recommendationId);
      const recommendatorProfile =
        await this.getProfileOrThrow(recommendedById);

      if (
        await recommendedProfile.$has('recommendations', recommendatorProfile, {
          transaction,
        })
      ) {
        throw ProfileErrors.alreadyRecommended;
      }
      await recommendedProfile.$add('recommendations', recommendatorProfile, {
        transaction,
      });
      Logger.debug('ProfileService | GetFullProfile | Finished');
      await recommendedProfile.save({ transaction });
      return ServiceResponse.ok(recommendedProfile, 201);
    });
  }

  public async revokeRecommendation(
    recommendedById: string,
    recommendationId: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');
    return this.database.sequelize.transaction(async (transaction) => {
      const recommendedProfile = await this.getProfileOrThrow(recommendationId);
      const recommendatorProfile =
        await this.getProfileOrThrow(recommendedById);
      if (
        !(await recommendedProfile.$has(
          'recommendations',
          recommendatorProfile,
          { transaction }
        ))
      ) {
        throw ProfileErrors.notRecommended;
      }

      recommendedProfile.$remove('recommendations', recommendatorProfile, {
        transaction,
      });
      await recommendedProfile.save({ transaction });
      Logger.debug('ProfileService | GetFullProfile | Finished');
      return ServiceResponse.ok(recommendedProfile);
    });
  }

  public async getFullProfile(
    id: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.debug('ProfileService | GetFullProfile | Started');

    const profileDb = await this.profileRepository.findById(id);
    if (profileDb === null) {
      throw ProfileErrors.profileDoesNotExist;
    }

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
  private async profileExistsByEmail(email: string) {
    return !!(await this.profileRepository.findByEmail(email));
  }
}
