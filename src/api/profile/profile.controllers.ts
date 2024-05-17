import {
  IExtraProfileInformation,
  IProfileCreationQuery,
  IProfileSearchQuery,
  ISearchableProfile,
} from '@/models/profile/profile';
import ImageUploader from '@/providers/ImageUploader';
import ProfileService from '@/services/profile/ProfileService';
import { IPaginationParams } from '@/shared/classes/pagination';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
export default class ProfileController {
  constructor(
    @Inject('ProfileService') private readonly profileService: ProfileService
  ) {}

  public uploadProfilePicture = handleAsync(async (req, res) => {
    const imageSaveResult = await ImageUploader.saveImage(
      req,
      'image',
      req.user.ProfileId + 'pp' + new Date().toISOString()
    );
    if (imageSaveResult === false) throw Error('Could not process image');

    const profileUpdateResponse = await this.profileService.updateProfile(
      req.user.ProfileId,
      { profilePictureUrl: imageSaveResult.link }
    );
    return sendResponse(res, profileUpdateResponse);
  });

  public uploadCoverPicture = handleAsync(async (req, res) => {
    const imageSaveResult = await ImageUploader.saveImage(
      req,
      'image',
      req.user.ProfileId + 'cover' + new Date().toISOString()
    );
    if (imageSaveResult === false) throw Error('Could not process image');

    const profileUpdateResponse = await this.profileService.updateProfile(
      req.user.ProfileId,
      { headerPictureUrl: imageSaveResult.link }
    );
    return sendResponse(res, profileUpdateResponse);
  });

  public search = handleAsync(async (req: Request, res: Response) => {
    const query: IProfileSearchQuery & IPaginationParams = req.body;
    const searchResults = await this.profileService.search(query);
    return sendResponse(res, searchResults);
  });

  public updateMe = handleAsync(async (req: Request, res: Response) => {
    const { ProfileId } = req.user;
    const newProfileInfo: ISearchableProfile & IExtraProfileInformation =
      req.body;

    const profileUpdateResponse = await this.profileService.updateProfile(
      ProfileId,
      newProfileInfo
    );
    return sendResponse(res, profileUpdateResponse);
  });

  public create = handleAsync(async (req: Request, res: Response) => {
    const newProfileInfo: IProfileCreationQuery = req.body;
    const accountsSignUpResponse =
      await this.profileService.createProfile(newProfileInfo);
    return sendResponse(res, accountsSignUpResponse);
  });

  public getUserProfile = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.getFullProfile(
      req.user.ProfileId
    );
    return sendResponse(res, profileMeResponse);
  });

  public recommendProfile = handleAsync(async (req: Request, res: Response) => {
    const profileMeResponse = await this.profileService.recommend(
      req.user.ProfileId,
      req.params.profileId
    );
    return sendResponse(res, profileMeResponse);
  });

  public adminRecommendProfile = handleAsync(
    async (req: Request, res: Response) => {
      const { recommendedById, recommendationId } = req.body;
      const profileMeResponse = await this.profileService.recommend(
        recommendedById,
        recommendationId
      );
      return sendResponse(res, profileMeResponse);
    }
  );

  public revokeRecommendation = handleAsync(
    async (req: Request, res: Response) => {
      const profileMeResponse = await this.profileService.revokeRecommendation(
        req.user.ProfileId,
        req.params.profileId
      );
      return sendResponse(res, profileMeResponse);
    }
  );

  public getFieldEnumeration = handleAsync(
    async (req: Request, res: Response) => {
      const { field } = req.params;
      const profileMeResponse = await this.profileService.enumerateField(field);
      return sendResponse(res, profileMeResponse);
    }
  );

  public attachParamToUser = async (
    req: Request,
    _: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      req.user = { email: '', role: 'user', ProfileId: req.params.profileId };
      return next();
    }
    req.user.ProfileId = req.params.profileId;
    next();
  };
}
