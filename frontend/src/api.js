// Frontend API Client connected to MERN Express Backend (/api/*)

const API_BASE = '/api';

export const api = {
  // Health
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Users & Auth
  async loginUser(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Authentication failed');
    }
    return result;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async createUser(data) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUser(id, data) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Courses
  async getCourses() {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },

  async createCourse(data) {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Quizzes
  async getQuizzes() {
    const res = await fetch(`${API_BASE}/quizzes`);
    return res.json();
  },

  async createQuiz(data) {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateQuiz(id, data) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteQuiz(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async generateAIQuiz(data) {
    const res = await fetch(`${API_BASE}/quizzes/generate-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Submissions
  async getSubmissions() {
    const res = await fetch(`${API_BASE}/submissions`);
    return res.json();
  },

  async submitQuiz(data) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async gradeSubmission(id, answerUpdates) {
    const res = await fetch(`${API_BASE}/submissions/${id}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answerUpdates }),
    });
    return res.json();
  },

  // Stats & Audit
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  async getLogs() {
    const res = await fetch(`${API_BASE}/logs`);
    return res.json();
  },
};
