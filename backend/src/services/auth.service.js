import { userRepository } from '../repositories/user.repository.js';
import { comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { USER_STATUS } from '../models/User.js';

export const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email, true);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Your account is currently inactive. Contact your administrator.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = generateToken(user._id);

    // Return safe user representation
    const safeUser = user.toJSON();

    return { user: safeUser, token };
  },

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.unauthorized('User session not found.');
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is inactive.');
    }
    return user.toJSON();
  },
};
