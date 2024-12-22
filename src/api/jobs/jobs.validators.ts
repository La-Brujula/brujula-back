import { EMPLOYMENT_OPTIONS, WORK_RADIUS_OPTIONS } from '@/models/jobs/enums';
import { z } from 'zod';
import { zodValidatePagination } from '../profile/profile.validators';

export const JobOpening = z.object({
  activity: z.string().length(6),
  count: z.number(),
  probono: z.boolean(),
  gender: z.optional(z.enum(['male', 'female', 'other'])),
  ageRangeMin: z.optional(z.number().min(0).max(120)),
  ageRangeMax: z.optional(z.number().min(0).max(120)),
  school: z.optional(z.string()),
  languages: z.optional(
    z.array(
      z.object({
        lang: z.string().length(2),
        proficiency: z.enum(['basic', 'intermediate', 'advanced', 'native']),
      })
    )
  ),
});

export const JobPosting = z.object({
  id: z.optional(z.string()),
  // Post
  requesterId: z.optional(z.string().max(128)),
  contactStartDate: z.date({ coerce: true }).catch(new Date()),
  contactEndDate: z
    .date({ coerce: true })
    .catch(
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5) /* 5 days */
    ),
  contactEmail: z.optional(z.string().email()),
  whatsapp: z.optional(z.string()),
  phoneNumbers: z.optional(z.array(z.string())),
  // Service
  openings: z.array(JobOpening).max(10),
  location: z.enum(['online', 'hybrid', 'in-person']),
  workRadius: z.enum(WORK_RADIUS_OPTIONS),
  specialRequirements: z.optional(z.string()),
  // Proyect
  employment: z.enum(EMPLOYMENT_OPTIONS),
  description: z.string().max(1024),
  jobStartDate: z.date({ coerce: true }).catch(new Date()),
  jobEndDate: z.optional(z.date({ coerce: true })),
  budgetLow: z.optional(z.number()),
  budgetHigh: z.optional(z.number()),
  benefits: z.optional(z.string().max(1024)),
  notes: z.optional(z.string().max(1024)),
});

export const JobPostingCreateRequest = z.object({
  body: JobPosting,
});

export const JobSearchOptions = z.object({
  query: z.optional(z.string()).catch(undefined),
  activity: z.optional(z.string()).catch(undefined),
  location: z.optional(z.string()).catch(undefined),
  probono: z.optional(z.boolean()).catch(undefined),
  employment: z.optional(z.enum(EMPLOYMENT_OPTIONS)).catch(undefined),
  ...zodValidatePagination,
});

export const JobSearchRequest = z.object({
  query: JobSearchOptions,
});

export const GetJobRequest = z.object({
  params: z.object({ id: z.string() }),
});
export const GetJobApplicantsRequest = z.object({
  params: z.object({ id: z.string() }),
  query: z.object({
    limit: z.optional(z.number().max(10).min(0)).default(10),
    offset: z.optional(z.number().min(0)).default(0),
  }),
});
