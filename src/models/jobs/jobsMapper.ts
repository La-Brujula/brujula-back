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
      createdAt: opening.createdAt,
    };
  }

  static buildDto(opening: JobOpening): TJobDetailDTO {
    return {
      id: opening.id,
      requester: {
        id: opening.job.requester.profile.id,
        primaryEmail: opening.job.requester.profile.primaryEmail,
        type: opening.job.requester.profile.type,
        fullName: [
          opening.job.requester.profile.firstName,
          opening.job.requester.profile.lastName,
        ].join(' '),
        searchable: opening.job.requester.profile.searchable,
        subscriber: opening.job.requester.profile.subscriber,
        recommendationsCount:
          opening.job.requester.profile.recommendationsCount,
        verified: opening.job.requester.profile.verified,
        nickName: opening.job.requester.profile.nickName,
        profilePictureUrl: opening.job.requester.profile.profilePictureUrl,
      },
      count: opening.count,
      activity: opening.activity,
      probono: opening.probono,
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
      createdAt: opening.createdAt,
      gender: opening.gender,
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
      contactStartDate: opening.job.contactStartDate,
      contactEndDate: opening.job.contactEndDate,
      applicantsCount: opening.applicants.length,
    };
  }
}
