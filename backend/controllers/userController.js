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

    const newUser = {
      id: `usr-${Date.now()}`,
      _id: `usr-${Date.now()}`,
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

    // Keep memoryStore updated regardless of DB connection state
    const existingIndex = memoryStore.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      memoryStore.users[existingIndex] = newUser;
    } else {
      memoryStore.users.unshift(newUser);
    }

    if (isConnected()) {
      try {
        await User.findOneAndUpdate({ email: cleanEmail }, newUser, { upsert: true, new: true });
      } catch (e) {
        console.warn('MongoDB user create warning:', e.message);
      }
    }

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
