import { JobOpening } from '@/database/schemas/Job';
import { IMapper } from '../base/mapper';
import { TJobAlertDTO, TJobDetailDTO, TJobListDTO, TJobPosting } from './jobs';
import { ProfileMapper } from '../profile/profileMapper';

export class JobMapper implements IMapper<TJobPosting> {
  static toDto(opening: { [k: string]: any }): TJobDetailDTO {
    return {
      id: opening.id,
      count: opening.count,
      gender: opening.gender,
      probono: opening.probono,
      activity: opening.activity,
      languages: opening.languages,
      ageRangeMin: opening.ageRangeMin,
      ageRangeMax: opening.ageRangeMax,
      notes: opening.notes,
      benefits: opening.benefits,
      whatsapp: opening.whatsapp,
      location: opening.location,
      budgetLow: opening.budgetLow,
      workRadius: opening.workRadius,
      employment: opening.employment,
      jobEndDate: opening.jobEndDate,
      budgetHigh: opening.budgetHigh,
      description: opening.description,
      contactEmail: opening.contactEmail,
      phoneNumbers: opening.phoneNumbers,
      jobStartDate: opening.jobStartDate,
      contactEndDate: opening.contactEndDate,
      contactStartDate: opening.contactStartDate,
      specialRequirements: opening.specialRequirements,
      requester: ProfileMapper.toBasicProfile(opening.requester?.profile),
    };
  }

  static buildDto(opening: {
    opening: {
      id: string;
      jobId: string;
      activity: string;
      count: number;
      probono: boolean;
      gender: 'male' | 'female' | 'other';
      ageRangeMin: number;
      ageRangeMax: number;
      languages: string[];
      school: string;
      searchString: string;
      createdAt: Date;
      updatedAt: Date;
    };
    job: {
      requesterId: string;
      contactStartDate: Date;
      contactEndDate: Date;
      contactEmail: string;
      whatsapp: string;
      phoneNumbers: string[];
      location: string;
      workRadius: string;
      specialRequirements: string;
      employment: string;
      description: string;
      jobStartDate: Date;
      jobEndDate?: Date;
      budgetLow?: number;
      budgetHigh?: number;
      benefits: string;
      notes: string;
    };
    requester: {
      id: string;
      primaryEmail: string;
      type: 'fisica' | 'moral';
      searchable: boolean;
      subscriber: boolean;
      recommendationsCount: number;
      firstName: string;
      lastName: string;
      verified: boolean;
      profilePictureUrl?: string;
      nickName: string;
    };
  }): TJobDetailDTO {
    return {
      id: opening.opening.id,
      requester: {
        id: opening.requester.id,
        primaryEmail: opening.requester.primaryEmail,
        type: opening.requester.type,
        fullName: [
          opening.requester.firstName,
          opening.requester.lastName,
        ].join(' '),
        searchable: opening.requester.searchable,
        subscriber: opening.requester.subscriber,
        recommendationsCount: opening.requester.recommendationsCount,
        verified: opening.requester.verified,
        nickName: opening.requester.nickName,
        profilePictureUrl: opening.requester.profilePictureUrl,
      },
      count: opening.opening.count,
      activity: opening.opening.activity,
      probono: opening.opening.probono,
      location: opening.job.location,
      workRadius: opening.job.workRadius,
      employment: opening.job.employment,
      description: opening.job.description,
      jobStartDate: opening.job.jobStartDate,
      jobEndDate: opening.job.jobEndDate,
      notes: opening.job.notes,
      phoneNumbers: opening.job.phoneNumbers,
      benefits: opening.job.benefits,
      whatsapp: opening.job.whatsapp,
      contactEmail: opening.job.contactEmail,
      specialRequirements: opening.job.specialRequirements,
      budgetLow: opening.job.budgetLow,
      budgetHigh: opening.job.budgetHigh,
      contactEndDate: opening.job.contactEndDate,
      contactStartDate: opening.job.contactStartDate,
    };
  }

  static toAlert(opening: JobOpening): TJobAlertDTO {
    return {
      id: opening.id,
      count: opening.count,
      gender: opening.gender,
      probono: opening.probono,
      activity: opening.activity,
      location: opening.job.requester.profile.location,
      languages: opening.languages,
      employment: opening.job.employment,
      workRadius: opening.job.workRadius,
      ageRangeMin: opening.ageRangeMin,
      ageRangeMax: opening.ageRangeMax,
      description: opening.job.description,
    };
  }

  static toList(openings: JobOpening[]): TJobListDTO[] {
    return openings.map(this.toListItem);
  }

  static toListItem(opening: JobOpening): TJobListDTO {
    return {
      id: opening.id,
      count: opening.count,
      gender: opening.gender,
      probono: opening.probono,
      activity: opening.activity,
      location: opening.job.location,
      languages: opening.languages,
      requester: ProfileMapper.toDto(opening.job.requester.profile),
      workRadius: opening.job.workRadius,
      employment: opening.job.employment,
      jobEndDate: opening.job.jobEndDate,
      description: opening.job.description,
      ageRangeMin: opening.ageRangeMin,
      ageRangeMax: opening.ageRangeMax,
      jobStartDate: opening.job.jobStartDate,
    };
  }
}
