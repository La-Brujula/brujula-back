import {
  JobOpening,
  JobPosting,
  JobPostingCreateRequest,
  UpdateJobRequest,
} from '@/api/jobs/jobs.validators';
import { z } from 'zod';
import { EmploymentEnum, WorkRadiusEnum } from './enums';
import { IBasicProfile, IProfileDTO } from '../profile/profile';

// extract the inferred type
export type TJobPosting = z.infer<typeof JobPosting>;
export type TJobOpening = z.infer<typeof JobOpening>;
export type TJobPostingCreateRequest = z.infer<typeof JobPostingCreateRequest>;
export type TJobUpdateRequest = z.infer<typeof UpdateJobRequest>;

export type TJobAlertDTO = TJobOpening & {
  id: string;
  location: string;
  employment: EmploymentEnum;
  workRadius: WorkRadiusEnum;
  description: string;
};

export type TJobDetailDTO = TJobOpening & {
  id: string;
  requester: IBasicProfile;
  location: string;
  workRadius: WorkRadiusEnum;
  employment: EmploymentEnum;
  description: string;
  jobStartDate: Date;
  jobEndDate?: Date;
  notes?: string;
  phoneNumbers?: string[];
  benefits?: string;
  whatsapp?: string;
  contactEmail?: string;
  specialRequirements?: string;
  budgetLow?: number;
  budgetHigh?: number;
  contactEndDate?: Date;
  contactStartDate?: Date;
  applicants?: IBasicProfile[];
  createdAt: Date;
};

export type TJobListDTO = TJobOpening & {
  id: string;
  requester: IProfileDTO;
  location: string;
  workRadius: WorkRadiusEnum;
  employment: EmploymentEnum;
  description: string;
  jobStartDate: Date;
  jobEndDate: Date;
  contactStartDate: Date;
  contactEndDate: Date;
  applicantsCount: number;
};

export interface IJobSearchOptions {
  query: string;
  activity: string;
  location: string;
  probono: boolean;
  employment: EmploymentEnum;
  requesterId: string;
  userId: string;
}
export interface IJobsSearchOptions {
  query: string;
  activity: string;
  location: string;
  probono: boolean;
  employment: EmploymentEnum;
  requesterId: string;
  primaryActivity?: string;
  secondaryActivity?: string;
  thirdActivity?: string;
}
