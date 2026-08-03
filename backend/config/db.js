import mongoose from 'mongoose';

// Initial in-memory mock store used if MONGODB_URI is not supplied or connection fails
export const memoryStore = {
  users: [
    {
      id: 'usr-admin-seed',
      _id: 'usr-admin-seed',
      name: 'System Admin',
      email: 'Admin@ad.ad',
      password: 'Admin@ad.ad',
      role: 'admin',
      department: 'System Administration',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ],
  courses: [
    {
      id: 'c-101',
      _id: 'c-101',
      code: 'CS101',
      title: 'Introduction to Data Structures & Algorithms',
      department: 'Computer Science',
      facultyId: 'usr-1',
      facultyName: 'Dr. Sarah Jenkins',
    },
    {
      id: 'c-202',
      _id: 'c-202',
      code: 'CS202',
      title: 'Database Management & Systems Design',
      department: 'Computer Science',
      facultyId: 'usr-1',
      facultyName: 'Dr. Sarah Jenkins',
    },
  ],
  quizzes: [
    {
      id: 'q-1',
      _id: 'q-1',
      title: 'Data Structures Midterm Assessment',
      description: 'Comprehensive review covering Arrays, Trees, Hash Tables, and Time Complexity.',
      courseId: 'c-101',
      courseCode: 'CS101',
      courseName: 'Introduction to Data Structures & Algorithms',
      facultyId: 'usr-1',
      facultyName: 'Dr. Sarah Jenkins',
      durationMinutes: 20,
      passPercentage: 70,
      totalPoints: 30,
      isPublished: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      questions: [
        {
          id: 'q1-1',
          text: 'What is the worst-case time complexity of accessing an element in an unsorted Array?',
          type: 'multiple-choice',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correctAnswer: 2,
          explanation: 'In an unsorted array, accessing or searching by value requires checking each element one by one, resulting in O(n) linear time.',
          points: 10,
        },
        {
          id: 'q1-2',
          text: 'In a Binary Search Tree (BST), all keys in the left subtree are smaller than the parent node key.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'By definition of a BST, every left descendant is strictly smaller than the parent node.',
          points: 10,
        },
        {
          id: 'q1-3',
          text: 'Which data structure follows the First-In, First-Out (FIFO) ordering principle?',
          type: 'multiple-choice',
          options: ['Stack', 'Queue', 'Binary Heap', 'Graph'],
          correctAnswer: 1,
          explanation: 'A Queue enforces FIFO (First-In, First-Out), whereas a Stack uses LIFO.',
          points: 10,
        },
      ],
    },
  ],
  submissions: [
    {
      id: 'sub-1',
      _id: 'sub-1',
      quizId: 'q-1',
      quizTitle: 'Data Structures Midterm Assessment',
      courseCode: 'CS101',
      studentId: 'usr-2',
      studentName: 'Alex Rivera',
      studentEmail: 'alex.rivera@student.edu',
      score: 30,
      totalPossible: 30,
      percentage: 100,
      passed: true,
      timeSpentSeconds: 480,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      answers: {
        'q1-1': { answer: 2, isCorrect: true, pointsEarned: 10, feedback: 'Excellent work!' },
        'q1-2': { answer: 0, isCorrect: true, pointsEarned: 10, feedback: 'Spot on!' },
        'q1-3': { answer: 1, isCorrect: true, pointsEarned: 10, feedback: 'Correct!' },
      },
    },
  ],
  logs: [
    {
      id: 'log-1',
      _id: 'log-1',
      userId: 'usr-[#3]',
      userName: 'Elena Rostova',
      userRole: 'admin',
      action: 'SYSTEM_BOOT',
      details: 'MERN Stack Quiz Master system initialized successfully.',
      timestamp: new Date().toISOString(),
    },
  ],
};

let isConnectedToMongo = false;

export default async function connectDB() {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('[MERN DB] No MONGO_URI provided. Operating with in-memory MongoDB data layer.');
    return false;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnectedToMongo = true;
    console.log('[MERN DB] MongoDB connected successfully via Mongoose.');

    // Seed initial admin user if not present in MongoDB
    try {
      const User = mongoose.models.User || mongoose.model('User');
      if (User) {
        const seedUser = memoryStore.users[0];
        await User.findOneAndUpdate(
          { email: seedUser.email.toLowerCase() },
          seedUser,
          { upsert: true, new: true }
        );
      }
    } catch (sErr) {
      console.warn('[MERN DB] Admin seed check notice:', sErr.message);
    }

    return true;
  } catch (err) {
    console.warn('[MERN DB] Could not connect to external MongoDB URI. Using resilient in-memory data store instead.', err.message);
    isConnectedToMongo = false;
    return false;
  }
}

export function isConnected() {
  return isConnectedToMongo;
}
