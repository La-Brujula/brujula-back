export const LOCATION_OPTIONS: readonly [string, ...string[]] = [
  'online',
  'hybrid',
  'in-person',
];
type LocationOptionsList = typeof EMPLOYMENT_OPTIONS;
export type LocationEnum = LocationOptionsList[number];

export const EMPLOYMENT_OPTIONS: readonly [string, ...string[]] = [
  'freelance',
  'determinate',
  'indeterminate',
];
type EmploymentOptionsList = typeof EMPLOYMENT_OPTIONS;
export type EmploymentEnum = EmploymentOptionsList[number];

export const WORK_RADIUS_OPTIONS: readonly [string, ...string[]] = [
  'local',
  'state',
  'national',
  'international',
];
type WorkRadiusList = typeof EMPLOYMENT_OPTIONS;
export type WorkRadiusEnum = WorkRadiusList[number];
