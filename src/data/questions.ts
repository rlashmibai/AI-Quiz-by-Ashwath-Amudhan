export type QuestionType =
  | 'text'
  | 'true-false'
  | 'image-question'
  | 'visual-puzzle'
  | 'image-options'
  | 'captcha-grid'
  | 'captcha-pairs'
  | 'captcha-sequence';

export interface QuizImage {
  src: string;
  alt: string;
}

export interface QuizOption {
  text: string;
  image?: QuizImage;
}

export interface CaptchaGridTile {
  id: string;
  label: string;
  imageSrc?: string;
  isCorrect: boolean;
}

export interface CaptchaPairItem {
  id: string;
  label: string;
  logoSrc: string;
  matchId: string;
}

export interface CaptchaSequenceStep {
  id: string;
  label: string;
  imageSrc: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  instruction?: string;
  questionImage?: QuizImage;
  options: QuizOption[];
  correctIndex: number;
  explanation?: string;
  // Grid CAPTCHA fields
  gridTheme?: 'purple-blue' | 'dark-neon' | 'blue-captcha';
  gridTiles?: CaptchaGridTile[];
  // Pairs CAPTCHA fields
  leftPairs?: CaptchaPairItem[];
  rightPairs?: Array<{ id: string; label: string; logoSrc: string }>;
  // Sequence CAPTCHA fields
  sequenceSteps?: CaptchaSequenceStep[];
}

/**
 * Editable Quiz Questions File
 * ----------------------------
 * - Put any local quiz images inside `public/images/`
 * - Reference them with `/images/...`
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // 1. Normal Question
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
  // 2. CAPTCHA: Generative AI Logo Grid
  {
    id: 11,
    type: 'captcha-grid',
    gridTheme: 'purple-blue',
    question: 'Can you identify the Generative AI tools by their logos?',
    instruction: 'Select all the logos that represent Generative AI tools.',
    options: [],
    correctIndex: 0,
    explanation:
      'ChatGPT, Google Gemini, Claude, Midjourney, and DeepSeek are Generative AI tools, while Excel, Windows, PowerPoint, and VLC are traditional software applications.',
    gridTiles: [
      { id: 'logo-chatgpt', label: 'ChatGPT', imageSrc: '/images/logos/chatgpt.svg', isCorrect: true },
      { id: 'logo-gemini', label: 'Google Gemini', imageSrc: '/images/logos/gemini.svg', isCorrect: true },
      { id: 'logo-claude', label: 'Claude', imageSrc: '/images/logos/claude.svg', isCorrect: true },
      { id: 'logo-midjourney', label: 'Midjourney', imageSrc: '/images/logos/midjourney.svg', isCorrect: true },
      { id: 'logo-deepseek', label: 'DeepSeek', imageSrc: '/images/logos/deepseek.svg', isCorrect: true },
      { id: 'logo-excel', label: 'Microsoft Excel', imageSrc: '/images/logos/excel.svg', isCorrect: false },
      { id: 'logo-windows', label: 'Microsoft Windows', imageSrc: '/images/logos/windows.svg', isCorrect: false },
      { id: 'logo-powerpoint', label: 'Microsoft PowerPoint', imageSrc: '/images/logos/powerpoint.svg', isCorrect: false },
      { id: 'logo-vlc', label: 'VLC Media Player', imageSrc: '/images/logos/vlc.svg', isCorrect: false },
    ],
  },
  // 3. Normal Question
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
  // 4. CAPTCHA: Connect-the-Pairs
  {
    id: 12,
    type: 'captcha-pairs',
    question: 'Match the AI tool with its company',
    instruction: 'Tap an AI tool on the left, then tap its creator company on the right.',
    options: [],
    correctIndex: 0,
    explanation:
      'ChatGPT is built by OpenAI, Gemini by Google, Claude by Anthropic, and Llama by Meta.',
    leftPairs: [
      { id: 'tool-chatgpt', label: 'ChatGPT', logoSrc: '/images/logos/chatgpt.svg', matchId: 'co-openai' },
      { id: 'tool-gemini', label: 'Gemini', logoSrc: '/images/logos/gemini.svg', matchId: 'co-google' },
      { id: 'tool-claude', label: 'Claude', logoSrc: '/images/logos/claude.svg', matchId: 'co-anthropic' },
      { id: 'tool-llama', label: 'Llama', logoSrc: '/images/logos/llama.svg', matchId: 'co-meta' },
    ],
    rightPairs: [
      { id: 'co-meta', label: 'Meta', logoSrc: '/images/logos/meta.svg' },
      { id: 'co-anthropic', label: 'Anthropic', logoSrc: '/images/logos/anthropic.svg' },
      { id: 'co-openai', label: 'OpenAI', logoSrc: '/images/logos/openai.svg' },
      { id: 'co-google', label: 'Google', logoSrc: '/images/logos/google.svg' },
    ],
  },
  // 5. Normal Question
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
  // 6. CAPTCHA: Sequence-Based AI Training
  {
    id: 13,
    type: 'captcha-sequence',
    question: 'How is an AI model trained?',
    instruction: 'Arrange the following steps in the correct sequence.',
    options: [],
    correctIndex: 0,
    explanation:
      'Building an AI model follows a clear pipeline: Collect data, Prepare data, Train the model, and Evaluate the model.',
    sequenceSteps: [
      {
        id: 'step-collect',
        label: 'Collect data',
        imageSrc: '/images/captcha/seq-collect.jpg',
        orderIndex: 0,
      },
      {
        id: 'step-prepare',
        label: 'Prepare data',
        imageSrc: '/images/captcha/seq-prepare.jpg',
        orderIndex: 1,
      },
      {
        id: 'step-train',
        label: 'Train the model',
        imageSrc: '/images/captcha/seq-train.jpg',
        orderIndex: 2,
      },
      {
        id: 'step-evaluate',
        label: 'Evaluate the model',
        imageSrc: '/images/captcha/seq-evaluate.jpg',
        orderIndex: 3,
      },
    ],
  },
  // 7. Normal Question
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
  // 8. CAPTCHA: Dark Futuristic Text Terminology
  {
    id: 14,
    type: 'captcha-grid',
    gridTheme: 'dark-neon',
    question: 'Identify AI terminology.',
    instruction: 'Select all applicable tiles.',
    options: [],
    correctIndex: 0,
    explanation:
      'Hallucination, LLM, Neural Network, Prompt and Machine Learning are commonly used AI terms.',
    gridTiles: [
      { id: 'term-hallucination', label: 'Hallucination', isCorrect: true },
      { id: 'term-llm', label: 'LLM', isCorrect: true },
      { id: 'term-neural', label: 'Neural Network', isCorrect: true },
      { id: 'term-prompt', label: 'Prompt', isCorrect: true },
      { id: 'term-ml', label: 'Machine Learning', isCorrect: true },
      { id: 'term-bluetooth', label: 'Bluetooth', isCorrect: false },
      { id: 'term-hdmi', label: 'HDMI', isCorrect: false },
      { id: 'term-usb', label: 'USB', isCorrect: false },
      { id: 'term-ethernet', label: 'Ethernet', isCorrect: false },
    ],
  },
  // 9. Normal Question
  {
    id: 16,
    type: 'text',
    question: 'What does LLM stand for in Artificial Intelligence?',
    options: [
      { text: 'A. Local Learning Machine' },
      { text: 'B. Large Language Model' },
      { text: 'C. Long Logic Memory' },
      { text: 'D. Light Link Module' },
    ],
    correctIndex: 1,
    explanation:
      'A Large Language Model (LLM) is an AI model trained on vast amounts of text so it can understand and generate human-like language.',
  },
  // 10. CAPTCHA: Real-World AI Image Grid
  {
    id: 15,
    type: 'captcha-grid',
    gridTheme: 'blue-captcha',
    question: 'Which of these uses Artificial Intelligence?',
    instruction: 'Select all applicable images.',
    options: [],
    correctIndex: 0,
    explanation:
      'Artificial Intelligence is already part of our everyday lives, from traffic predictions and entertainment recommendations to smartphone security and voice assistants.',
    gridTiles: [
      {
        id: 'ai-maps',
        label: 'Google Maps traffic predictions',
        imageSrc: '/images/captcha/maps.jpg',
        isCorrect: true,
      },
      {
        id: 'ai-netflix',
        label: 'Netflix movie recommendations',
        imageSrc: '/images/captcha/netflix.jpg',
        isCorrect: true,
      },
      {
        id: 'ai-faceid',
        label: 'Smartphone facial recognition',
        imageSrc: '/images/captcha/face-id.jpg',
        isCorrect: true,
      },
      {
        id: 'ai-spam',
        label: 'AI-powered email spam detection',
        imageSrc: '/images/captcha/email-spam.jpg',
        isCorrect: true,
      },
      {
        id: 'ai-voice',
        label: 'Smart voice assistant (Alexa or Siri)',
        imageSrc: '/images/captcha/voice-assistant.jpg',
        isCorrect: true,
      },
      {
        id: 'non-calc',
        label: 'Basic calculator',
        imageSrc: '/images/captcha/calculator.jpg',
        isCorrect: false,
      },
      {
        id: 'non-clock',
        label: 'Traditional wall clock',
        imageSrc: '/images/captcha/wall-clock.jpg',
        isCorrect: false,
      },
      {
        id: 'non-stapler',
        label: 'Manual stapler',
        imageSrc: '/images/captcha/stapler.jpg',
        isCorrect: false,
      },
      {
        id: 'non-abacus',
        label: 'Traditional abacus',
        imageSrc: '/images/captcha/abacus.jpg',
        isCorrect: false,
      },
    ],
  },
];
