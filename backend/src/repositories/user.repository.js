import { User } from '../models/User.js';

export const userRepository = {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  },

  async findById(id, includePassword = false) {
    const query = User.findById(id);
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  },

  async create(userData) {
    const user = new User(userData);
    return user.save();
  },

  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return User.find(filter).sort(sort).exec();
  },

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
  },

  async deleteById(id) {
    return User.findByIdAndDelete(id).exec();
  },
};
