import { IMapper } from '../base/mapper';
import { IProfile, IProfileDTO, IRecommendedBy } from './profile';

export class ProfileMapper implements IMapper<IProfile> {
  static toDto(profile: IProfile): IProfileDTO {
    if (!profile) {
      throw new Error('Profile cannot be null');
    }
    return {
      primaryEmail: profile.primaryEmail,
      fullName: profile.fullName,
      id: profile.id,
      type: profile.type,
      subscriber: profile.subscriber,
      recommendationsCount: profile.recommendationsCount,
      nickName: profile.nickName,
      primaryActivity: profile.primaryActivity,
      secondaryActivity: profile.secondaryActivity,
      thirdActivity: profile.thirdActivity,
      gender: profile.gender,
      location: profile.location,
      profilePictureUrl: profile.profilePictureUrl,
      headline: profile.headline,
    };
  }
}
