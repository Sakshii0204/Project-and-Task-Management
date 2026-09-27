import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Assign sanitized/parsed inputs back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params;
    if (parsed.query) req.query = parsed.query;

    next();
  } catch (err) {
    if (err.errors) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join('.').replace(/^(body|params|query)\./, ''),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation failed', formattedErrors));
    }
    next(err);
  }
};
