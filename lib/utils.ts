import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SCORE_COLOR = (s: number | null) =>
  s == null ? 'bg-gray-100 text-gray-500' :
  s >= 80   ? 'bg-green-100 text-green-700' :
  s >= 60   ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700';

export const REC_LABEL: Record<string, string> = {
  strong_yes: '⭐ Strong Yes', yes: '✓ Yes', maybe: '~ Maybe', no: '✗ No',
};

export const STAGE_COLORS: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700',
  screening:   'bg-purple-50 text-purple-700',
  interview:   'bg-amber-50 text-amber-700',
  final_round: 'bg-orange-50 text-orange-700',
  offered:     'bg-green-50 text-green-700',
  hired:       'bg-green-100 text-green-800',
  rejected:    'bg-gray-100 text-gray-500',
};

export const CLASSIFICATION_COLORS: Record<string, string> = {
  job_application: 'bg-blue-100 text-blue-700',
  follow_up:       'bg-purple-100 text-purple-700',
  referral:        'bg-green-100 text-green-700',
  inquiry:         'bg-amber-100 text-amber-700',
  spam:            'bg-gray-100 text-gray-500',
  other:           'bg-gray-100 text-gray-500',
};
