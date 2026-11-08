import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 12;
// Used so login takes the same time whether or not the account exists
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser({ name, email, phone, password, community }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      community: { name: community || '' },
      consentAt: new Date(),
    });
    return { user, token: signToken(user) };
  } catch (err) {
    // 11000 = duplicate key. The database unique index is the real guard
    // (checking first and then saving can fail if two people register at once).
    if (err.code === 11000) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'An account with these details already exists. Try logging in instead.'
      );
    }
    throw err;
  }
}

export async function loginUser({ identifier, password }) {
  const query = identifier.includes('@')
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };

  const user = await User.findOne(query).select('+passwordHash');
  const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  // Same message for "no such user" and "wrong password" (TC-02)
  if (!user || !passwordOk) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Incorrect email/phone or password.');
  }
  if (user.accountStatus !== 'active') {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account is not active. Please contact support.');
  }

  return { user, token: signToken(user) };
}