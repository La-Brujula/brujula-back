import { body, query } from 'express-validator';

export const bodyMatchesSearchQuery = [
  query('name').optional().trim().isString().trim().toLowerCase(),
  query('activity')
    .optional()
    .trim()
    .isString()
    .trim()
    .matches(/\d\d{2}?-?\d{2}?/),
  query('location').optional().trim().isString().trim().toLowerCase(),
  query('gender')
    .optional()
    .trim()
    .isString()
    .trim()
    .toLowerCase()
    .isIn(['male', 'female', 'other']),
  query('remote').optional().trim().isBoolean().toBoolean(),
  query('type').optional().trim().isString().trim().toLowerCase().isIn(['moral', 'fisica']),
  query('language').optional().trim().isString().isISO6391(),
  query('university').optional().trim().isString().trim().toLowerCase(),
  query('probono').optional().trim().isBoolean().toBoolean(),
  query('associations').optional().trim().isString().trim().toLowerCase(),
  query('certifications').optional().trim().isString().trim().toLowerCase(),
  query('email').optional().trim().isString().isEmail().normalizeEmail(),
];

export const validatePagination = [
  query('limit').optional().trim().isInt({ min: 1, max: 10 }).default(10).toInt(),
  query('offset').optional().trim().isInt({ min: 0 }).default(0).toInt(),
];

export const validateProfileCreation = [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['moral', 'fisica']),
];

export const validateProfileUpdate = [
  body('firstName').optional().trim().isString().isLength({ min: 1, max: 128 }).trim(),
  body('lastName').optional().trim().isString().isLength({ min: 1, max: 128 }).trim(),
  body('nickName').optional().trim().isString().isLength({ min: 1, max: 128 }).trim(),
  body('secondaryEmails').optional().trim().isArray(),
  body('secondaryEmails.*').optional().trim().isEmail().normalizeEmail(),
  body('primaryActivity')
    .optional()
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('secondaryActivity')
    .optional()
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('thirdActivity')
    .optional()
    .trim()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('phoneNumbers').optional().trim().isArray(),
  body('phoneNumbers.*').optional().trim().isString(),
  body('languages')
    .optional()
    .trim()
    .isArray()
    .customSanitizer((userInput) => {
      return userInput.map(
        (v: { lang: string; proficiency: 'basic' | 'intermediate' | 'advanced' | 'native' }) =>
          `${v.lang}:${v.proficiency}`
      );
    }),
  body('languages.*.lang').optional().trim().isString().isISO6391(),
  body('languages.*.proficiency')
    .optional()
    .trim()
    .isString()
    .isIn(['basic', 'intermediate', 'advanced', 'native']),
  body('gender').optional().trim().isString().isIn(['male', 'female', 'other']),
  body('state').optional().trim().isString().isLength({ min: 1, max: 128 }),
  body('city').optional().trim().isString().isLength({ min: 1, max: 64 }),
  body('country').optional().trim().isISO31661Alpha2(),
  body('postalCode').optional().trim().isPostalCode('any'),
  body('workRadius').optional().trim().isIn(['local', 'state', 'national', 'international']),
  body('university').optional().trim().isString().isLength({ min: 1, max: 128 }),
  body('associations').optional().trim().isString().isLength({ min: 1, max: 512 }),
  body('remote').optional().trim().isBoolean().toBoolean(),
  body('probono').optional().trim().isBoolean().toBoolean(),
  body('certifications').optional().trim().isString().isLength({ min: 1, max: 512 }),
  body('headline').optional().trim().isString().isLength({ min: 1, max: 60 }),
  body('birthday').optional().trim().isISO8601(),
];
