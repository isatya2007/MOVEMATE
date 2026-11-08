import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Please log in to continue.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.accountStatus !== 'active') {
    throw new AppError(401, 'UNAUTHENTICATED', 'Please log in to continue.');
  }

  req.user = user;
  next();
});

// Use later for admin routes: restrictTo('admin', 'moderator')
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'FORBIDDEN', 'You do not have permission to do this.'));
  }
  next();
};