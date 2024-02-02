import { body, query } from 'express-validator';
import isISO6391 from 'validator/lib/isISO6391';

export const bodyMatchesSearchQuery = [
  body('name').optional().isString().trim().toLowerCase(),
  body('activity')
    .optional()
    .isString()
    .trim()
    .matches(/\d\d{2}?-?\d{2}?/),
  body('location').optional().isString().trim().toLowerCase(),
  body('gender').optional().isString().trim().toLowerCase().isIn(['male', 'female', 'other']),
  body('remote').optional().isBoolean().toBoolean(),
  body('type').optional().isString().trim().toLowerCase().isIn(['moral', 'fisica']),
  body('language').optional().isString().isISO6391(),
  body('university').optional().isString().isString().trim().toLowerCase(),
  body('probono').optional().isBoolean().toBoolean(),
  body('associations').optional().isString().isString().trim().toLowerCase(),
  body('certifications').optional().isString().isString().trim().toLowerCase(),
];

export const validatePagination = [
  query('limit').optional().isInt({ min: 1, max: 10 }).default(10).toInt(),
  query('offset').optional().isInt({ min: 0 }).default(0).toInt(),
];

export const validateProfileCreation = [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['moral', 'fisica']),
];

export const validateProfileUpdate = [
  body('firstName').optional().isString().isLength({ min: 1, max: 32 }).trim(),
  body('lastName').optional().isString().isLength({ min: 1, max: 64 }).trim(),
  body('nickName').optional().isString().isLength({ min: 1, max: 32 }).trim(),
  body('secondaryEmails').optional().isArray(),
  body('secondaryEmails.*').optional().isEmail().normalizeEmail(),
  body('primaryActivity')
    .optional()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('secondaryActivity')
    .optional()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('thirdActivity')
    .optional()
    .isString()
    .matches(/\d{3}-\d{2}/),
  body('phoneNumbers').optional().isArray(),
  body('phoneNumbers.*').optional().isMobilePhone('any'),
  body('languages')
    .optional()
    .isArray()
    .custom((userInput) => {
      userInput.forEach(
        (v: {
          language: string;
          proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
        }) => {
          if (!isISO6391(v.language)) {
            throw Error(`Invalid language code ${v.language}. Use ISO639-1`);
          }
          if (!['basic', 'intermediate', 'advanced', 'native'].includes(v.proficiency)) {
            throw Error(
              'Unsupported proficiency, please use one of: "basic", "intermediate", "advanced", "native"'
            );
          }
        }
      );
    })
    .customSanitizer((userInput) => {
      return userInput.map(
        (v: { language: string; proficiency: 'basic' | 'intermediate' | 'advanced' | 'native' }) =>
          `${v.language}:${v.proficiency}`
      );
    }),
  body('gender').optional().isString().isIn(['male', 'female', 'other']),
  body('state').optional().isString().isLength({ min: 1, max: 128 }),
  body('city').optional().isString().isLength({ min: 1, max: 64 }),
  body('country').optional().isISO31661Alpha2(),
  body('postalCode').optional().isPostalCode('any'),
  body('workRadius').optional().isIn(['local', 'state', 'national', 'international']),
  body('university').optional().isString().isLength({ min: 1, max: 64 }),
  body('associations').optional().isString().isLength({ min: 1, max: 300 }),
  body('remote').optional().isBoolean().toBoolean(),
  body('probono').optional().isBoolean().toBoolean(),
  body('certifications').optional().isString().isLength({ min: 1, max: 300 }),
  body('headline').optional().isString().isLength({ min: 1, max: 60 }),
];
