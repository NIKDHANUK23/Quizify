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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    let user = null;

    if (isConnected()) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i') } });
    }

    if (!user) {
      user = memoryStore.users.find((u) => u.email && u.email.trim().toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. User not found.' });
    }

    // Verify password case-insensitively for user convenience
    if (user.password) {
      const storedPass = String(user.password).trim();
      if (storedPass !== cleanPassword && storedPass.toLowerCase() !== cleanPassword.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }
    }

    return res.json({
      success: true,
      user,
      token: `jwt-auth-token-${user.id || user._id || 'mock'}`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const newId = `usr-${Date.now()}`;
    const newUser = {
      id: newId,
      _id: newId,
      name: name || 'User',
      email: cleanEmail,
      password: password || 'password123',
      role: role || 'student',
      department: department || 'General',
      avatar: role === 'faculty'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : role === 'admin'
        ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    let savedUser = newUser;

    if (isConnected()) {
      try {
        savedUser = await User.findOneAndUpdate(
          { email: cleanEmail },
          newUser,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        console.warn('MongoDB user create error:', e.message);
      }
    }

    const existingIndex = memoryStore.users.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      memoryStore.users[existingIndex] = savedUser;
    } else {
      memoryStore.users.unshift(savedUser);
    }

    return res.status(201).json(savedUser);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isConnected()) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        updates,
        { new: true }
      );
      if (updated) {
        const idx = memoryStore.users.findIndex((u) => u.id === id || u._id === id);
        if (idx !== -1) memoryStore.users[idx] = updated;
        return res.json(updated);
      }
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
      await User.findOneAndDelete({ $or: [{ _id: id }, { id: id }] });
    }

    memoryStore.users = memoryStore.users.filter((u) => u.id !== id && u._id !== id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
