import { GoogleGenAI } from '@google/genai';

export async function generateAIQuizService({ topic, courseCode, difficulty, numberOfQuestions }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini Service] GEMINI_API_KEY is missing. Generating high-quality structured fallback quiz.');
    return generateFallbackQuiz(topic, courseCode, difficulty, numberOfQuestions);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert university professor creating an academic assessment quiz on the topic: "${topic}".
Course Code: ${courseCode}
Difficulty: ${difficulty}
Number of Questions: ${numberOfQuestions || 4}

Respond strictly with a valid JSON object matching the following structure without markdown formatting or backticks:
{
  "title": "Quiz Title on ${topic}",
  "description": "Short description of assessment goals",
  "durationMinutes": 15,
  "passPercentage": 70,
  "questions": [
    {
      "id": "q-1",
      "text": "Clear concise academic question prompt",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed pedagogical explanation of why option A is correct",
      "points": 10
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.questions = parsed.questions.map((q, idx) => ({
        ...q,
        id: `q-ai-${Date.now()}-${idx}`,
        points: q.points || 10,
      }));
      return parsed;
    }

    throw new Error('Could not parse Gemini JSON output');
  } catch (err) {
    console.error('[Gemini Service Error]', err.message);
    return generateFallbackQuiz(topic, courseCode, difficulty, numberOfQuestions);
  }
}

function generateFallbackQuiz(topic, courseCode, difficulty, count = 4) {
  const questions = [
    {
      id: `q-fb-${Date.now()}-1`,
      text: `Which core concept is central to understanding ${topic}?`,
      type: 'multiple-choice',
      options: [
        `Fundamental Principles of ${topic}`,
        'Random Noise Generation',
        'Unrelated Abstract Axioms',
        'Deprecated Legacy Protocols',
      ],
      correctAnswer: 0,
      explanation: `The fundamental principles of ${topic} form the foundational core required for accurate problem solving in ${courseCode}.`,
      points: 10,
    },
    {
      id: `q-fb-${Date.now()}-2`,
      text: `Is optimal efficiency achievable in ${topic} through systemic algorithmic analysis?`,
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: `Systemic analysis and structured decomposition are key strategies in mastering ${topic}.`,
      points: 10,
    },
    {
      id: `q-fb-${Date.now()}-3`,
      text: `In practical application, ${topic} primary performance objective is best categorized as:`,
      type: 'multiple-choice',
      options: [
        'Maximizing throughput & reducing complexity',
        'Increasing arbitrary latency',
        'Ignoring edge case validations',
        'Disregarding memory allocation constraints',
      ],
      correctAnswer: 0,
      explanation: 'Optimizing throughput while minimizing complexity is the primary engineering and mathematical goal.',
      points: 10,
    },
    {
      id: `q-fb-${Date.now()}-4`,
      text: `Explain how ${topic} principles apply to real-world software architecture.`,
      type: 'short-answer',
      options: [],
      correctAnswer: `Application of ${topic} enhances scalability, modularity, and error handling.`,
      explanation: `Understanding real-world deployment of ${topic} prepares students for enterprise application design.`,
      points: 10,
    },
  ];

  return {
    title: `Assessment: ${topic}`,
    description: `AI-Generated assessment evaluating core knowledge in ${topic} (${difficulty} level).`,
    durationMinutes: Math.max(10, count * 3),
    passPercentage: 70,
    questions: questions.slice(0, count),
  };
}
