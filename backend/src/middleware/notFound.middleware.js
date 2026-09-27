import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found`));
};
