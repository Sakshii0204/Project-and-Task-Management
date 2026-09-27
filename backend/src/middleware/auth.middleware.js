import { verifyToken, TOKEN_COOKIE_NAME } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { USER_STATUS } from '../models/User.js';

export const authenticate = async (req, _res, next) => {
  try {
    let token = req.cookies?.[TOKEN_COOKIE_NAME];

    // Fallback: Authorization header (Bearer <token>)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. No session token provided.'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Session expired. Please log in again.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return next(ApiError.unauthorized('User associated with session no longer exists.'));
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return next(ApiError.forbidden('Your account is currently inactive. Contact system administrator.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
