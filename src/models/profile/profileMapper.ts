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
      headerPictureUrl: profile.headerPictureUrl,
      headline: profile.headline,
    };
  }
  static toProfile(profile: Profile): IProfile {
    if (!profile) {
      throw new Error('Profile cannot be null');
    }
    return {
      associations: profile.associations,
      awards: profile.awards,
      birthday: profile.birthday,
      biography: profile.biography,
      certifications: profile.certifications,
      city: profile.city,
      country: profile.country,
      externalLinks: profile.externalLinks,
      facebook: profile.facebook,
      firstName: profile.firstName,
      fullName: profile.fullName,
      gender: profile.gender,
      headline: profile.headline,
      headerPictureUrl: profile.headerPictureUrl,
      id: profile.id,
      imdb: profile.imdb,
      instagram: profile.instagram,
      languages: profile.languages,
      lastName: profile.lastName,
      linkedin: profile.linkedin,
      location: profile.location,
      nickName: profile.nickName,
      phoneNumbers: profile.phoneNumbers,
      postalCode: profile.postalCode,
      primaryActivity: profile.primaryActivity,
      primaryEmail: profile.primaryEmail,
      probono: profile.probono,
      profilePictureUrl: profile.profilePictureUrl,
      recommendations: profile.recommendations?.map(
        ProfileMapper.toBasicProfile
      ),
      recommendationsCount: profile.recommendationsCount,
      remote: profile.remote,
      searchable: profile.searchable,
      secondaryActivity: profile.secondaryActivity,
      secondaryEmails: profile.secondaryEmails,
      state: profile.state,
      subscriber: profile.subscriber,
      thirdActivity: profile.thirdActivity,
      tiktok: profile.tiktok,
      twitter: profile.twitter,
      type: profile.type,
      university: profile.university,
      vimeo: profile.vimeo,
      whatsapp: profile.whatsapp,
      workRadius: profile.workRadius,
      youtube: profile.youtube,
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
