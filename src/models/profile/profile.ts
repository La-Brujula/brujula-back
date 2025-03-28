export interface IProfile
  extends IBasicProfile,
    ISearchableProfile,
    IExtraProfileInformation {}

export interface IBasicProfile {
  id: string;
  primaryEmail: string;
  type: 'moral' | 'fisica';
  fullName?: string;
  searchable: boolean;
  subscriber: boolean;
  recommendationsCount: number;
  verified?: boolean;
  profilePictureUrl?: string;
  nickName?: string;
}

export interface ISearchableProfile {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  secondaryEmails?: string[];
  primaryActivity?: string;
  recommendations?: IProfile[];
  secondaryActivity?: string;
  thirdActivity?: string;
  phoneNumbers?: string[];
  languages?: { lang: string; proficiency: string }[];
  gender?: 'male' | 'female' | 'other';
  state?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  location?: string;
  workRadius?: 'local' | 'state' | 'national' | 'international';
  university?: string;
  associations?: string;
  remote?: boolean;
  probono?: boolean;
  certifications?: string;
}

export interface IExtraProfileInformation {
  awards?: string;
  biography?: string;
  headline?: string;
  birthday?: Date;
  externalLinks?: string[];
  whatsapp?: string;
  imdb?: string;
  facebook?: string;
  instagram?: string;
  vimeo?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  headerPictureUrl?: string;
  verified?: boolean;
  companyName?: string;
  jobTitle?: string;
  nationality?: string;
}

export interface IProfileDTO {
  id: string;
  primaryEmail: string;
  type: 'moral' | 'fisica';
  subscriber: boolean;
  fullName?: string;
  nickName?: string;
  primaryActivity?: string;
  recommendationsCount: number;
  secondaryActivity?: string;
  thirdActivity?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  country?: string;
  profilePictureUrl?: string;
  headerPictureUrl?: string;
  headline?: string;
  verified?: boolean;
}

export interface IRecommendedBy {
  email: string;
  fullName?: string;
  id: string;
}

export interface IProfileCreationQuery {
  email: string;
  type: 'moral' | 'fisica';
}

export interface IProfileSearchQuery {
  query?: string;
  name?: string;
  activity?: string;
  location?: string;
  gender?: 'male' | 'female' | 'other';
  remote?: boolean;
  type?: 'moral' | 'fisica';
  language?: string;
  university?: string;
  probono?: boolean;
  associations?: string;
  certifications?: string;
  email?: string;
  country?: string;
}

export type EnumeratableField = 'city' | 'state' | 'university';

export const ENUMERATABLE_FIELDS = ['city', 'state', 'university'];
