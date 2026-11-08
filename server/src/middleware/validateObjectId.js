import { AppError } from '../utils/AppError.js';

export const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params[param])) {
    return next(new AppError(404, 'NOT_FOUND', 'Resource not found.'));
  }
  next();
};