import Course from '../models/Course.js';
import { memoryStore, isConnected } from '../config/db.js';

export const getCourses = async (req, res) => {
  try {
    if (isConnected()) {
      const courses = await Course.find().sort({ createdAt: -1 });
      return res.json(courses);
    }
    return res.json(memoryStore.courses);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { code, title, department, facultyId, facultyName } = req.body;
    const newCourse = {
      id: `c-${Date.now()}`,
      _id: `c-${Date.now()}`,
      code,
      title,
      department,
      facultyId,
      facultyName: facultyName || 'Faculty Lead',
      createdAt: new Date().toISOString(),
    };

    if (isConnected()) {
      const courseDoc = await Course.create(newCourse);
      return res.status(201).json(courseDoc);
    }

    memoryStore.courses.push(newCourse);
    return res.status(201).json(newCourse);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
