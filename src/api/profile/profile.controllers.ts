import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import ProfileService from '@/services/profile/ProfileService';
import { IPaginationParams } from '@/shared/classes/pagination';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
export default class ProfileController {
  constructor(@Inject('ProfileService') private readonly profileService: ProfileService) {}

  public search = handleAsync(async (req: Request, res: Response) => {
    const query: IProfileSearchQuery & IPaginationParams = req.body;
    const searchResults = await this.profileService.search(query);
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

  public getUserProfile = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.getFullProfile(req.user.ProfileId);
    return sendResponse(res, profileMeResponse);
  });

  public recommendProfile = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.recommend(
      req.user.ProfileId,
      req.params.profileId
    );
    return sendResponse(res, profileMeResponse);
  });

  public revokeRecommendation = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.revokeRecommendation(
      req.user.ProfileId,
      req.params.profileId
    );
    return sendResponse(res, profileMeResponse);
  });

  public attachParamToUser = async (req: Request, _: Response, next: NextFunction) => {
    if (!req.user) {
      req.user = { email: '', role: 'user', ProfileId: req.params.profileId };
      return next();
    }
    req.user.ProfileId = req.params.profileId;
    next();
  };
}
