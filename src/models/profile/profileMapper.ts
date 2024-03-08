import Profile from '@/database/schemas/Profile';
import { IMapper } from '../base/mapper';
import { IBasicProfile, IProfile, IProfileDTO } from './profile';

export class ProfileMapper implements IMapper<IProfile> {
  static toDto(profile: Profile): IProfileDTO {
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
  static toProfile(profile: Profile): IProfile {
    if (!profile) {
      throw new Error('Profile cannot be null');
    }
    return {
      id: profile.id,
      primaryEmail: profile.primaryEmail,
      type: profile.type,
      searchable: profile.searchable,
      recommendationsCount: profile.recommendationsCount,
      subscriber: profile.subscriber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      nickName: profile.nickName,
      gender: profile.gender,
      primaryActivity: profile.primaryActivity,
      secondaryActivity: profile.secondaryActivity,
      thirdActivity: profile.thirdActivity,
      secondaryEmails: profile.secondaryEmails,
      phoneNumbers: profile.phoneNumbers,
      languages: profile.languages,
      externalLinks: profile.externalLinks,
      whatsapp: profile.whatsapp,
      imdb: profile.imdb,
      facebook: profile.facebook,
      instagram: profile.instagram,
      vimeo: profile.vimeo,
      youtube: profile.youtube,
      linkedin: profile.linkedin,
      twitter: profile.twitter,
      tiktok: profile.tiktok,
      headline: profile.headline,
      state: profile.state,
      city: profile.city,
      country: profile.country,
      postalCode: profile.postalCode,
      location: profile.location,
      university: profile.university,
      associations: profile.associations,
      certifications: profile.certifications,
      probono: profile.probono,
      remote: profile.remote,
      workRadius: profile.workRadius,
      profilePictureUrl: profile.profilePictureUrl,
      recommendations: profile.recommendations?.map(
        ProfileMapper.toBasicProfile
      ),
    };
  }
  static toBasicProfile(profile: Profile): IBasicProfile {
    if (!profile) {
      throw new Error('Profile cannot be null');
    }
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
