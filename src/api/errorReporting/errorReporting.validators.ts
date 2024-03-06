import { body } from 'express-validator';

export const bodyMatchesErrorReporting = [
  body('pathname').isString().trim(),
  body('name').isString().trim(),
  body('message').isString().trim(),
  body('stack').isString().trim(),
];
