import { ENUMERATABLE_FIELDS } from '@/models/profile/profile';
import { body, param, query } from 'express-validator';

export const bodyMatchesSearchQuery = [
  query('query')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase(),
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
    .isIn(['male', 'female', 'other']),
  query('remote').optional({ values: 'falsy' }).trim().isBoolean().toBoolean(),
  query('type')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .trim()
    .toLowerCase()
    .isIn(['moral', 'fisica']),
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
  query('email')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isEmail()
    .normalizeEmail(),
];

export const validatePagination = [
  query('limit')
    .optional({ values: 'falsy' })
    .trim()
    .isInt({ min: 1, max: 10 })
    .default(10)
    .toInt(),
  query('offset')
    .optional({ values: 'falsy' })
    .trim()
    .isInt({ min: 0 })
    .default(0)
    .toInt(),
];

export const validateFieldEnumeration = [
  param('field').isIn(ENUMERATABLE_FIELDS),
];

export const validateProfileCreation = [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['moral', 'fisica']),
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
  body('secondaryEmails.*')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .normalizeEmail(),
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
    .isIn(['basic', 'intermediate', 'advanced', 'native']),
  body('gender')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isIn(['male', 'female', 'other']),
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
  body('country').optional({ values: 'falsy' }).trim().isISO31661Alpha2(),
  body('postalCode').optional({ values: 'falsy' }).trim().isPostalCode('any'),
  body('workRadius')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['local', 'state', 'national', 'international']),
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
  body('headline')
    .optional({ values: 'falsy' })
    .trim()
    .isString()
    .isLength({ min: 1, max: 60 }),
  body('birthday').optional({ values: 'falsy' }).trim().isISO8601().toDate(),
  body('profilePictureUrl').optional({ values: 'falsy' }).trim().isURL(),
  body('headerPictureUrl').optional({ values: 'falsy' }).trim().isURL(),
  body('externalLinks').optional({ values: 'falsy' }).isArray(),
  body('externalLinks.*').optional({ values: 'falsy' }).isURL(),
  ...[
    'whatsapp',
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
