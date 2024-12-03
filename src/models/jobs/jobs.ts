import {
  JobOpening,
  JobPosting,
  JobPostingCreateRequest,
} from '@/api/jobs/jobs.validators';
import { z } from 'zod';
import { EmploymentEnum, WorkRadiusEnum } from './enums';

// extract the inferred type
export type TJobPosting = z.infer<typeof JobPosting>;
export type TJobOpening = z.infer<typeof JobOpening>;
export type TJobPostingCreateRequest = z.infer<typeof JobPostingCreateRequest>;

export type TJobAlertDTO = TJobOpening & {
  id: string;
  location: string;
  employment: EmploymentEnum;
  workRadius: WorkRadiusEnum;
  description: string;
};

export type TJobDetailDTO = TJobOpening & {
  id: string;
  requesterId: string;
  location: string;
  workRadius: WorkRadiusEnum;
  employment: EmploymentEnum;
  description: string;
  jobStartDate: Date;
  jobEndDate: Date;
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
};

export type TJobListDTO = TJobOpening & {
  id: string;
  requester: string;
  location: string;
  workRadius: WorkRadiusEnum;
  employment: EmploymentEnum;
  description: string;
  jobStartDate: Date;
  jobEndDate: Date;
};

export interface IJobSearchOptions {
  query: string;
  activity: string;
  location: string;
  probono: boolean;
  employment: EmploymentEnum;
}
