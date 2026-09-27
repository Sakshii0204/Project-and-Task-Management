import { ApiError } from '../utils/ApiError.js';

export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before authorization check.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: [${req.user.role}]`
        )
      );
    }

    next();
  };
};
