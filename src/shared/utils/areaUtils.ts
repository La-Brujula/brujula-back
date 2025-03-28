import areas from '@shared/constants/areas.json';
import { EnumGender } from '../types/genders';

interface translations {
  fr: string | null;
  es: string | null;
  en: string | null;
}

type Activity = {
  Femenino: translations;
  Masculino: translations;
  'No Binario': translations;
  'Persona Moral': translations;
  'Alias Genérico': translations;
  Referentes: string[];
};

type Subarea = Record<string, Activity>;
type Area = Record<string, Subarea>;
export type AreaName = keyof typeof areas;

export function getTitle(
  userActivity: string,
  gender: EnumGender = 'other',
  locale: 'en' | 'es' = 'es'
): string {
  let genderForTitle: keyof Activity;
  if (!userActivity) return '';
  if (!['male', 'female', 'other'].includes(gender)) {
    throw Error(
      'Unknown gender please use one of "Femenino", "Masculino", "No binario", "Prefiero no decir"' +
        gender
    );
  }
  switch (gender) {
    case 'male':
      genderForTitle = 'Masculino';
      break;
    case 'female':
      genderForTitle = 'Femenino';
      break;
    case 'other':
      genderForTitle = 'Alias Genérico';
      break;
  }
  const area: Area = areas[getAreaFromId(userActivity)];
  const subarea: Subarea = area[getSubAreaFromId(userActivity)];
  const activity: Activity = subarea[userActivity];
  return !!activity
    ? !!activity[genderForTitle]
      ? activity[genderForTitle][locale] || ''
      : activity['Alias Genérico'][locale] || ''
    : userActivity;
}

export function getAreaObjectByIndex(area: number) {
  if (typeof area !== typeof 0) throw 'noesnumero';
  return Object.entries(areas)[area - 1][1];
}

export function getAreaObjectByName(areaName: keyof typeof areas) {
  return areas[areaName] as Area;
}

export function getAreaByIndex(area: number): keyof typeof areas {
  return Object.keys(areas)[area - 1] as keyof typeof areas;
}

export function getSubAreaObjectByName(
  area: keyof typeof areas,
  subareaName: string
) {
  const areaObj = areas[area] as Record<string, any>;
  const subareaObj = areaObj[subareaName];
  if (subareaObj === undefined) {
    throw Error('Subarea not found in area');
  }
  return subareaObj;
}

export function getSubAreaObject(
  area: keyof typeof areas,
  subareaIndex: number
) {
  const subarea = areas[area];
  if (!subarea)
    throw Error(`Can't find area ${area} with index ${subareaIndex}`);
  return Object.entries(areas[area])[subareaIndex - 1][1];
}

export function getSubAreaByIndex(area: Area, subareaIndex: number): string {
  return Object.keys(area)[subareaIndex - 1];
}

export function getActivityObject(activity: string) {
  const subarea: Subarea = getSubAreaObjectFromId(activity);
  return subarea[activity];
}

export function getAreaObjectFromId(activity: string) {
  return getAreaObjectByIndex(parseInt(activity.charAt(0)));
}

export function getAreaFromId(activity: string): keyof typeof areas {
  return getAreaByIndex(parseInt(activity.charAt(0)));
}

export function getSubAreaObjectFromId(activity: string) {
  return getSubAreaObject(
    getAreaFromId(activity),
    parseInt(activity.split('-')[0].slice(1))
  );
}

export function getSubAreaFromId(activity: string): string {
  return getSubAreaByIndex(
    getAreaObjectFromId(activity),
    parseInt(activity.split('-')[0].slice(1))
  );
}
