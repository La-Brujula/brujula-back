import {
  IProfileSearchQuery,
  IProfileCreationQuery,
  IProfileDTO,
  ISearchableProfile,
  IExtraProfileInformation,
  IProfile,
  ENUMERATABLE_FIELDS,
} from '@/models/profile/profile';
import { ProfileRepository } from '@/repositories/ProfileRepository';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { Inject, Service } from 'typedi';
import { ProfileMapper } from '@/models/profile/profileMapper';
import ProfileErrors from './ProfileErrors';
import Logger from '@/providers/Logger';
import { IPaginationParams } from '@/shared/classes/pagination';
import Database from '@/database/Database';
import Profile from '@/database/schemas/Profile';
import { ServiceError } from '@/shared/classes/serviceError';

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
    Logger.verbose('ProfileService | createProfile | Start');
    return this.database.sequelize.transaction(async (transaction) => {
      Logger.verbose(
        'ProfileService | createProfile | Checking if profile already exists'
      );
      if (await this.profileExistsByEmail(newAccount.email)) {
        throw ProfileErrors.existingProfile;
      }

      Logger.verbose('ProfileService | createProfile | Creating profile');
      const profileRecord = await this.profileRepository.create(
        newAccount,
        transaction
      );
      Logger.verbose('ProfileService | createProfile | Created profile');

      const profile = ProfileMapper.toDto(profileRecord);
      Logger.verbose('ProfileService | createProfile | Finished');
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
    const [total_profiles, dbProfiles] = await this.profileRepository.find(
      parameters,
      pagination
    );
    const profiles = dbProfiles.map(ProfileMapper.toProfile);
    Logger.verbose('ProfileService | Search | Got results');
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
    Logger.verbose('ProfileService | GetFullProfile | Started');
    return this.database.sequelize.transaction(async (transaction) => {
      const recommendedProfile = await this.getProfileOrThrow(recommendationId);
      await this.getProfileOrThrow(recommendedById);

      if (
        await this.profileRepository.recommendationExists(
          recommendationId,
          recommendedById,
          transaction
        )
      ) {
        throw ProfileErrors.alreadyRecommended;
      }
      await this.profileRepository.recommend(
        recommendationId,
        recommendedById,
        transaction
      );
      Logger.verbose('ProfileService | GetFullProfile | Finished');
      await recommendedProfile.save();
      return ServiceResponse.ok(recommendedProfile, 201);
    });
  }

  public async revokeRecommendation(
    recommendedById: string,
    recommendationId: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.verbose('ProfileService | GetFullProfile | Started');
    return this.database.sequelize.transaction(async (transaction) => {
      const recommendedProfile = await this.getProfileOrThrow(recommendationId);
      await this.getProfileOrThrow(recommendedById);

      if (
        !(await this.profileRepository.recommendationExists(
          recommendationId,
          recommendedById,
          transaction
        ))
      ) {
        throw ProfileErrors.notRecommended;
      }

      await this.profileRepository.removeRecommendation(
        recommendationId,
        recommendedById,
        transaction
      );
      await recommendedProfile.save();
      Logger.verbose('ProfileService | GetFullProfile | Finished');
      return ServiceResponse.ok(recommendedProfile);
    });
  }

  public async enumerateField(
    fieldName: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.verbose('ProfileService | EnumerateField | Started');
    if (!ENUMERATABLE_FIELDS.includes(fieldName)) {
      throw ProfileErrors.fieldNotAllowed;
    }

    const fieldValues = await this.profileRepository
      .getAllValuesForField(fieldName)
      .catch((e) => {
        throw ServiceError.internalError(e.name);
      });
    if (fieldValues === null) {
      throw ProfileErrors.fieldValuesNotFound;
    }

    const valuesList = [];
    for (const entry of fieldValues) {
      const value = entry[fieldName as keyof Profile];
      if (!!value) {
        valuesList.push(value);
      }
    }
    Logger.verbose('ProfileService | EnumerateField | Finished');
    return ServiceResponse.ok(valuesList);
  }

  public async getFullProfile(
    id: string
  ): Promise<ServiceResponse<IProfileDTO>> {
    Logger.verbose('ProfileService | GetFullProfile | Started');

    const profileDb = await this.profileRepository.findById(id);
    if (profileDb === null) {
      throw ProfileErrors.profileDoesNotExist;
    }

    const profile = ProfileMapper.toProfile(profileDb);
    Logger.verbose('ProfileService | GetFullProfile | Finished');
    return ServiceResponse.ok(profile);
  }

  public async updateProfile(
    id: string,
    params: ISearchableProfile & IExtraProfileInformation
  ): Promise<ServiceResponse<IProfile>> {
    Logger.verbose('ProfileService | GetFullProfile | Started');
    const profile = await this.profileRepository.update(id, params);
    if (profile === null) {
      throw ProfileErrors.profileDoesNotExist;
    }
    Logger.verbose('ProfileService | GetFullProfile | Finished');
    return ServiceResponse.ok(profile);
  }

  private async profileExists(id: string) {
    return !!(await this.profileRepository.findById(id));
  }
  private async profileExistsByEmail(email: string) {
    return !!(await this.profileRepository.findByEmail(email));
  }
}
