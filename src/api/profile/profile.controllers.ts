import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileDTO,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import Logger from '@/providers/Logger';
import ProfileService from '@/services/profile/ProfileService';
import { IPaginationParams } from '@/shared/classes/pagination';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
export default class ProfileController {
  constructor(@Inject('ProfileService') private readonly profileService: ProfileService) {}

  public search = handleAsync(async (req: Request, res: Response) => {
    const query: IProfileSearchQuery & IPaginationParams = req.body;
    const searchResults: ServiceResponse<IProfileDTO[]> = await this.profileService.search(query);
    return sendResponse(res, searchResults);
  });

  public updateMe = handleAsync(async (req: Request, res: Response) => {
    const { ProfileId } = req.user;
    const newProfileInfo: ISearchableProfile & IExtraProfileInformation = req.body;
    const accountsSignUpResponse = await this.profileService.updateProfile(
      ProfileId,
      newProfileInfo
    );
    return sendResponse(res, accountsSignUpResponse);
  });

  public create = handleAsync(async (req: Request, res: Response) => {
    const newProfileInfo: IProfileCreationQuery = req.body;
    const accountsSignUpResponse = await this.profileService.createProfile(newProfileInfo);
    return sendResponse(res, accountsSignUpResponse);
  });

  public me = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.getFullProfile(req.user.ProfileId);
    return sendResponse(res, profileMeResponse);
  });
}
