import { JobOpening } from '@/database/schemas/Job';
import { IMapper } from '../base/mapper';
import { TJobAlertDTO, TJobDetailDTO, TJobListDTO, TJobPosting } from './jobs';

export class JobMapper implements IMapper<TJobPosting> {
  static toDto(opening: JobOpening): TJobDetailDTO {
    return {
      id: opening.id,
      count: opening.count,
      gender: opening.gender,
      probono: opening.probono,
      activity: opening.activity,
      languages: opening.languages,
      ageRangeMin: opening.ageRangeMin,
      ageRangeMax: opening.ageRangeMax,
      notes: opening.job.notes,
      benefits: opening.job.benefits,
      whatsapp: opening.job.whatsapp,
      location: opening.job.location,
      budgetLow: opening.job.budgetLow,
      workRadius: opening.job.workRadius,
      employment: opening.job.employment,
      jobEndDate: opening.job.jobEndDate,
      budgetHigh: opening.job.budgetHigh,
      requesterId: opening.job.requesterId,
      description: opening.job.description,
      contactEmail: opening.job.contactEmail,
      phoneNumbers: opening.job.phoneNumbers,
      jobStartDate: opening.job.jobStartDate,
      contactEndDate: opening.job.contactEndDate,
      contactStartDate: opening.job.contactStartDate,
      specialRequirements: opening.job.specialRequirements,
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
      requester: opening.job.requesterId,
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
