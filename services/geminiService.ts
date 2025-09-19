
import { GoogleGenAI, Type } from '@google/genai';
import { Question } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questionText: {
      type: Type.STRING,
      description: 'The math question text, for example, "¿Cuánto es 5 + 3?".',
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 4 possible answers as strings.',
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: 'The index (0-3) of the correct answer in the options array.',
    },
  },
  required: ['questionText', 'options', 'correctAnswerIndex'],
};

export const generateMathQuestion = async (topic: string, level: number): Promise<Question | null> => {
  try {
    const prompt = `Generate a new multiple-choice math question in Spanish for a child at skill level ${level} (1 is easy, 10 is hard). The topic is "${topic}". Provide one correct answer and three plausible but incorrect answers. The correct answer should not be the first option. Ensure the format is valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
        temperature: 1,
      },
    });

    const jsonText = response.text.trim();
    const parsedQuestion = JSON.parse(jsonText);
    
    // Validate the parsed object to match the Question interface
    if (
      typeof parsedQuestion.questionText === 'string' &&
      Array.isArray(parsedQuestion.options) &&
      parsedQuestion.options.length === 4 &&
      typeof parsedQuestion.correctAnswerIndex === 'number'
    ) {
      return {
        text: parsedQuestion.questionText,
        options: parsedQuestion.options,
        correctAnswerIndex: parsedQuestion.correctAnswerIndex,
      };
    } else {
      console.error('Gemini response did not match expected schema:', parsedQuestion);
      return null;
    }

  } catch (error) {
    console.error('Error generating question with Gemini:', error);
    return null;
  }
};

export const generateSummary = async (topic: string, subject: 'math' | 'history'): Promise<string | null> => {
  try {
    let prompt: string;
    if (subject === 'math') {
        prompt = `Genera un resumen muy breve y fácil de entender para un niño de 7 años sobre la "${topic}". Explica un truco o dato curioso si es posible. El resumen debe estar en español y no debe exceder las 50 palabras.`;
    } else { // history
        prompt = `Genera un resumen muy breve y emocionante para un niño de 7 años sobre la "${topic}". Menciona 2 o 3 datos curiosos o importantes de forma sencilla. El resumen debe estar en español y no debe exceder las 60 palabras.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return response.text.trim();

  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    return null;
  }
};
