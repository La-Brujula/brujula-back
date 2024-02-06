import Profile from '@/database/schemas/Profile';
import { IMapper } from '../base/mapper';
import { IBasicProfile, IProfile, IProfileDTO } from './profile';

export class ProfileMapper implements IMapper<IProfile> {
  static toDto(profile: Profile): IProfileDTO {
    if (!profile) {
      throw new Error('Profile cannot be null');
    }
    profile = profile.dataValues;
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
  static toProfile(profile: Profile): IProfile {
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
      recommendations: profile.recommendations?.map(this.toBasicProfile),
      gender: profile.gender,
      location: profile.location,
      profilePictureUrl: profile.profilePictureUrl,
      headline: profile.headline,
      searchable: profile.searchable,
    };
  }
  static toBasicProfile(profile: Profile): IBasicProfile {
    profile = profile.dataValues;
    return {
      id: profile.id,
      primaryEmail: profile.primaryEmail,
      type: profile.type,
      searchable: profile.searchable,
      subscriber: profile.subscriber,
      recommendationsCount: profile.recommendationsCount,
      fullName: profile.fullName,
    };
  }
}
