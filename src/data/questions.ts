export type QuestionType = 'text' | 'true-false' | 'image-question' | 'visual-puzzle' | 'image-options';

export interface QuizImage {
  src: string;
  alt: string;
}

export interface QuizOption {
  text: string;
  image?: QuizImage;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  questionImage?: QuizImage;
  options: QuizOption[];
  correctIndex: number;
  explanation?: string;
}

/**
 * Editable Quiz Questions File
 * ----------------------------
 * - Put any local quiz images inside the `public/images/` folder.
 * - Reference them with `/images/your-file.jpg`.
 * - `correctIndex` is 0-based (0 = first option, 1 = second option, etc.).
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    type: 'text',
    question: 'What does AI stand for?',
    options: [
      { text: 'A. Automated Information' },
      { text: 'B. Artificial Intelligence' },
      { text: 'C. Advanced Internet' },
      { text: 'D. Automatic Innovation' },
    ],
    correctIndex: 1,
    explanation:
      'Artificial Intelligence enables computers to perform tasks that usually require human intelligence, such as learning, reasoning, and recognizing patterns.',
  },
  {
    id: 2,
    type: 'text',
    question: 'In which year was Artificial Intelligence formally established as a field of study?',
    options: [
      { text: 'A. 1956' },
      { text: 'B. 1995' },
      { text: 'C. 2005' },
      { text: 'D. 2022' },
    ],
    correctIndex: 0,
    explanation:
      'AI was formally founded as an academic discipline at the Dartmouth Conference in the summer of 1956.',
  },
  {
    id: 3,
    type: 'text',
    question: 'Who is commonly known as the Father of Artificial Intelligence?',
    options: [
      { text: 'A. Elon Musk' },
      { text: 'B. Bill Gates' },
      { text: 'C. John McCarthy' },
      { text: 'D. Steve Jobs' },
    ],
    correctIndex: 2,
    explanation:
      'Computer scientist John McCarthy coined the term "Artificial Intelligence" in 1955 and helped organize the 1956 Dartmouth Conference.',
  },
  {
    id: 4,
    type: 'text',
    question: 'Which of the following uses Artificial Intelligence?',
    options: [
      { text: 'A. Google Maps traffic predictions' },
      { text: 'B. Netflix movie recommendations' },
      { text: 'C. Smartphone facial recognition' },
      { text: 'D. All of the above' },
    ],
    correctIndex: 3,
    explanation:
      'Navigation apps, streaming recommendations, and smartphone face unlock all rely on AI to analyze data and recognize patterns.',
  },
  {
    id: 6,
    type: 'text',
    question: 'Which of the following is a Generative AI tool?',
    options: [
      { text: 'A. Calculator' },
      { text: 'B. ChatGPT' },
      { text: 'C. Stopwatch' },
      { text: 'D. Digital clock' },
    ],
    correctIndex: 1,
    explanation:
      'ChatGPT is a Generative AI tool that creates new text, ideas, and explanations based on your prompts.',
  },
  {
    id: 7,
    type: 'true-false',
    question: 'Can Artificial Intelligence give incorrect information?',
    options: [
      { text: 'A. Yes' },
      { text: 'B. No' },
    ],
    correctIndex: 0,
    explanation:
      'Yes — AI predicts answers from patterns in data and can sometimes make mistakes, so it is always wise to double-check important facts.',
  },
  {
    id: 8,
    type: 'text',
    question: 'What is an instruction or question given to an AI tool called?',
    options: [
      { text: 'A. Password' },
      { text: 'B. Commandment' },
      { text: 'C. Prompt' },
      { text: 'D. Notification' },
    ],
    correctIndex: 2,
    explanation:
      'A prompt is the text, question, or instruction you type to guide an AI tool toward the response you want.',
  },
  {
    id: 9,
    type: 'text',
    question: 'Which of the following should you avoid sharing with public AI chatbots?',
    options: [
      { text: 'A. A request for a recipe' },
      { text: 'B. A general knowledge question' },
      { text: 'C. A request for a bedtime story' },
      { text: 'D. Your banking password and OTP' },
    ],
    correctIndex: 3,
    explanation:
      'Never share private passwords, OTPs, financial details, or sensitive personal data with public AI tools.',
  },
  {
    id: 10,
    type: 'text',
    question: 'Can AI help parents with everyday parenting activities?',
    options: [
      { text: 'A. Suggesting bedtime stories' },
      { text: 'B. Creating daily routines' },
      { text: 'C. Suggesting educational activities' },
      { text: 'D. All of the above' },
    ],
    correctIndex: 3,
    explanation:
      'AI can help parents brainstorm creative bedtime stories, organize daily schedules, and discover fun learning activities.',
  },
];
