import { EMPLOYMENT_OPTIONS, WORK_RADIUS_OPTIONS } from '@/models/jobs/enums';
import { string, z } from 'zod';
import { zodValidatePagination } from '../profile/profile.validators';

export const JobOpening = z.object({
  activity: z.string().length(6),
  count: z.number({ coerce: true }),
  probono: z.boolean(),
  gender: z.optional(z.enum(['male', 'female', 'other'])).catch(undefined),
  ageRangeMin: z.optional(z.number({ coerce: true }).min(0).max(120)),
  ageRangeMax: z.optional(z.number({ coerce: true }).min(0).max(120)),
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

export const JobPosting = z
  .object({
    // Post
    requesterId: z.optional(z.string().max(128)),
    contactStartDate: z.date({ coerce: true, required_error: 'invalid_type' }),
    contactEndDate: z.date({ coerce: true }),
    contactEmail: z.optional(z.string().email()),
    whatsapp: z.optional(z.string()),
    phoneNumbers: z.optional(z.string().transform((v) => [v])),
    // Service
    openings: z.array(JobOpening).max(10),
    location: z.enum(['online', 'hybrid', 'in-person']),
    workRadius: z.optional(z.enum(WORK_RADIUS_OPTIONS)).catch(undefined),
    specialRequirements: z.optional(z.string()),
    // Proyect
    employment: z.enum(EMPLOYMENT_OPTIONS),
    description: z.string().max(1024),
    jobStartDate: z.date({ coerce: true }).catch(new Date()),
    jobEndDate: z.optional(z.date({ coerce: true })).catch(undefined),
    budgetLow: z.optional(z.number({ coerce: true })),
    budgetHigh: z.optional(z.number({ coerce: true })),
    benefits: z.optional(z.string().max(1024)),
    notes: z.optional(z.string().max(1024)),
  })
  .refine(
    ({ contactEmail, whatsapp, phoneNumbers }) =>
      !!contactEmail || !!whatsapp || !!phoneNumbers,
    {
      message: 'One of contactEmail, whatsapp, phoneNumbers must be defined',
      path: ['contactEmail'],
    }
  );

export const JobPostingCreateRequest = z.object({
  body: JobPosting,
});

export const JobSearchOptions = z.object({
  query: z.optional(z.string()).catch(undefined),
  activity: z.optional(z.string()).catch(undefined),
  location: z.optional(z.string()).catch(undefined),
  probono: z.optional(z.boolean()).catch(undefined),
  employment: z.optional(z.enum(EMPLOYMENT_OPTIONS)).catch(undefined),
  requesterId: z.optional(z.string()).catch(undefined),
  ...zodValidatePagination,
});

export const JobSearchRequest = z.object({
  query: JobSearchOptions,
});

export const JobIdInParamsRequest = z.object({
  params: z.object({ id: z.string() }),
});
export const GetJobApplicantsRequest = z.object({
  params: z.object({ id: z.string() }),
  query: z.object({
    limit: z.optional(z.number().max(10).min(0)).default(10),
    offset: z.optional(z.number().min(0)).default(0),
  }),
});

export const UpdateJobRequest = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    job: z.object({
      contactStartDate: z.optional(
        z.date({
          coerce: true,
          required_error: 'invalid_type',
        })
      ),
      contactEndDate: z.optional(z.date({ coerce: true })),
      contactEmail: z.optional(z.string().email()),
      whatsapp: z.optional(z.string()),
      phoneNumbers: z.optional(z.string().transform((v) => [v])),
      location: z.optional(z.enum(['online', 'hybrid', 'in-person'])),
      workRadius: z.optional(z.enum(WORK_RADIUS_OPTIONS)).catch(undefined),
      specialRequirements: z.optional(z.string()),
      employment: z.optional(z.enum(EMPLOYMENT_OPTIONS)),
      description: z.optional(z.string().max(1024)),
      jobStartDate: z.optional(z.date({ coerce: true }).catch(new Date())),
      jobEndDate: z.optional(z.date({ coerce: true })).catch(undefined),
      budgetLow: z.optional(z.number({ coerce: true })),
      budgetHigh: z.optional(z.number({ coerce: true })),
      benefits: z.optional(z.string().max(1024)),
      notes: z.optional(z.string().max(1024)),
    }),
    activity: z.optional(z.string().length(6)),
    count: z.optional(z.number({ coerce: true })),
    probono: z.optional(z.boolean()),
    gender: z.optional(z.enum(['male', 'female', 'other'])).catch(undefined),
    ageRangeMin: z.optional(z.number({ coerce: true }).min(0).max(120)),
    ageRangeMax: z.optional(z.number({ coerce: true }).min(0).max(120)),
    school: z.optional(z.string()),
    languages: z.optional(
      z.array(
        z.object({
          lang: z.string().length(2),
          proficiency: z.enum(['basic', 'intermediate', 'advanced', 'native']),
        })
      )
    ),
  }),
});
