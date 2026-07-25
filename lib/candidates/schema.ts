import { z } from 'zod';

export const CandidateProfileSchema = z.object({
  full_name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  portfolio_url: z.string().url().nullable(),
  current_role: z.string().nullable(),
  current_company: z.string().nullable(),
  experience_years: z.number().nullable(),
  skills: z.array(z.string()).default([]),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number().nullable(),
    field: z.string().nullable()
  })).default([]),
  work_history: z.array(z.object({
    role: z.string(),
    company: z.string(),
    duration: z.string(),
    responsibilities: z.array(z.string())
  })).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string())
  })).default([])
}).strict();

export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;
