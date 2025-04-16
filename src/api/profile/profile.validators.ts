import { ENUMERATABLE_FIELDS } from '@/models/profile/profile';
import { removeDiacritics } from '@/shared/utils/removeDiacritics';
import { body, param, query } from 'express-validator';
import { z } from 'zod';

export const bodyMatchesSearchQuery = [
  query('query')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase()
    .customSanitizer((v) => removeDiacritics(v)),
  query('name')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
  query('activity')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(/\d\d?\d?-?\d?\d?/),
  query('location')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
  query('gender')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase()
    .isIn(['male', 'female', 'other'])
    .withMessage('Must be either "male", "female", or "other"'),
  query('remote').optional({ values: 'falsy' }).trim().isBoolean().toBoolean(),
  query('type')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase()
    .isIn(['moral', 'fisica'])
    .withMessage('Must be either "moral" or "fisica"'),
  query('language').optional({ values: 'falsy' }).trim().isString().isISO6391(),
  query('university')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
  query('probono').optional({ values: 'falsy' }).trim().isBoolean().toBoolean(),
  query('associations')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
  query('certifications')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
  query('email').optional({ values: 'falsy' }).trim().isString().isEmail(),
  query('country')
    .optional({ values: 'falsy' })
    .trim()
    .isISO31661Alpha2()
    .default('MX'),
];

export const zodValidatePagination = {
  limit: z.optional(z.number({ coerce: true }).min(1).max(10).catch(10)),
  offset: z.optional(z.number({ coerce: true }).min(0).catch(0)),
};
export const validatePagination = [
  query('limit')
    .optional({ values: 'falsy' })
    .trim()
    .toInt()
    .isInt({ min: 1, max: 10 })
    .default(10),
  query('offset')
    .optional({ values: 'falsy' })
    .trim()
    .toInt()
    .isInt({ min: 0 })
    .default(0),
];

export const validateFieldEnumeration = [
  param('field')
    .isIn(ENUMERATABLE_FIELDS)
    .withMessage(
      `Must be one of ${ENUMERATABLE_FIELDS.map((field) => '"' + field + '"').join(', ')}`
    ),
];

export const validateProfileCreation = [
  body('email').isEmail(),
  body('type')
    .isIn(['moral', 'fisica'])
    .withMessage('Must be either "moral" or "fisica"'),
];

export const validateProfileUpdate = [
  body('firstName')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 128 }),
  body('lastName')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 128 }),
  body('nickName')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 128 }),
  body('secondaryEmails').optional({ values: 'falsy' }).trim().isArray(),
  body('secondaryEmails.*').optional({ values: 'falsy' }).trim().isEmail(),
  body('primaryActivity')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('secondaryActivity')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('thirdActivity')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('phoneNumbers').optional({ values: 'falsy' }).trim().isArray(),
  body('phoneNumbers.*').optional({ values: 'falsy' }).trim().isString(),
  body('languages')
    .optional({ values: 'falsy' })
    .isArray()
    .customSanitizer((userInput) => {
      return userInput.map(
        (v: {
          lang: string;
          proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
        }) => `${v.lang}:${v.proficiency}`
      );
    }),
  body('languages.*.lang')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isISO6391(),
  body('languages.*.proficiency')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isIn(['basic', 'intermediate', 'advanced', 'native'])
    .withMessage(
      'Must be either "basic", "intermediate", "advanced", or "native"'
    ),
  body('gender')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isIn(['male', 'female', 'other'])
    .withMessage('Must be either "male", "female", or "other"'),
  body('state')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 128 }),
  body('city')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 64 }),
  body('country')
    .optional({ values: 'falsy' })
    .trim()
    .isISO31661Alpha2()
    .default('MX'),
  body('postalCode').optional({ values: 'falsy' }).trim().isPostalCode('any'),
  body('workRadius')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['local', 'state', 'national', 'international'])
    .withMessage(
      'Must be one of "local", "state", "national" or "international"'
    ),
  body('university')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 128 }),
  body('associations')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 512 }),
  body('remote').optional({ values: 'null' }).trim().toBoolean().isBoolean(),
  body('probono').optional({ values: 'null' }).trim().toBoolean().isBoolean(),
  body('certifications')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 512 }),
  body('awards')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 512 }),
  body('biography')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 512 }),
  body('headline')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 60 }),
  body('companyName')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 60 }),
  body('jobTitle')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 60 }),
  body('nationality').optional({ values: 'falsy' }).trim().isISO31661Alpha2(),
  body('birthday').optional({ values: 'falsy' }).trim().isISO8601().toDate(),
  body('externalLinks').optional({ values: 'falsy' }).isArray(),
  body('externalLinks.*').optional({ values: 'falsy' }).isURL(),
  body('whatsapp')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => value.replace(/\s|-/g, ''))
    .isMobilePhone('any'),
  ...[
    'imdb',
    'facebook',
    'instagram',
    'vimeo',
    'youtube',
    'linkedin',
    'twitter',
    'tiktok',
  ].map((property) =>
    body(property)
      .optional({ values: 'falsy' })
      .trim()
      .isString()
      .isLength({ min: 1, max: 128 })
  ),
];
