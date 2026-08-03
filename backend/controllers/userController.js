import User from '../models/User.js';
import { memoryStore, isConnected } from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    if (isConnected()) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json(users);
    }
    return res.json(memoryStore.users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const newUser = {
      id: `usr-${Date.now()}`,
      _id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'student',
      department: department || 'General',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (isConnected()) {
      const userDoc = await User.create(newUser);
      return res.status(201).json(userDoc);
    }

    memoryStore.users.unshift(newUser);
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isConnected()) {
      const updated = await User.findByIdAndUpdate(id, updates, { new: true });
      return res.json(updated);
    }

    const index = memoryStore.users.findIndex((u) => u.id === id || u._id === id);
    if (index !== -1) {
      memoryStore.users[index] = { ...memoryStore.users[index], ...updates };
      return res.json(memoryStore.users[index]);
    }
    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnected()) {
      await User.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    memoryStore.users = memoryStore.users.filter((u) => u.id !== id && u._id !== id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
