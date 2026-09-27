import { userRepository } from '../repositories/user.repository.js';
import { hashPassword } from '../utils/password.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  async getAllUsers(filter = {}) {
    const users = await userRepository.findAll(filter);
    return users.map((u) => u.toJSON());
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(`User not found with ID: ${id}`);
    }
    return user.toJSON();
  },

  async createUser(userData) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) {
      throw ApiError.conflict(`User already exists with email: ${userData.email}`);
    }

    const hashedPassword = await hashPassword(userData.password);

    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return newUser.toJSON();
  },

  async updateUser(id, updates) {
    // Explicit security rule: prevent accidental password changes through generic user update
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.password;

    if (sanitizedUpdates.email) {
      const existing = await userRepository.findByEmail(sanitizedUpdates.email);
      if (existing && existing._id.toString() !== id) {
        throw ApiError.conflict(`Email ${sanitizedUpdates.email} is already in use by another account.`);
      }
    }

    const updatedUser = await userRepository.updateById(id, sanitizedUpdates);
    if (!updatedUser) {
      throw ApiError.notFound(`User not found with ID: ${id}`);
    }

    return updatedUser.toJSON();
  },

  async updateUserStatus(id, status) {
    const updatedUser = await userRepository.updateById(id, { status });
    if (!updatedUser) {
      throw ApiError.notFound(`User not found with ID: ${id}`);
    }
    return updatedUser.toJSON();
  },
};
