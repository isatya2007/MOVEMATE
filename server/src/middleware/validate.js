import { AppError } from '../utils/AppError.js';

function check(schema, data, next) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    next(new AppError(400, 'VALIDATION_ERROR', 'Please check the submitted fields.', details));
    return null;
  }
  return result.data;
}

// Checks the JSON body
export const validate = (schema) => (req, res, next) => {
  const data = check(schema, req.body, next);
  if (data) {
    req.body = data; // cleaned data; unknown fields are removed
    next();
  }
};

// Checks the URL query (?a=1&b=2). Cleaned values are in req.validatedQuery.
export const validateQuery = (schema) => (req, res, next) => {
  const data = check(schema, req.query, next);
  if (data) {
    req.validatedQuery = data;
    next();
  }
};