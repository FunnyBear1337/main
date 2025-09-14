export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatBotProps {
  apiKey: string;
  placeholder?: string;
  title?: string;
  className?: string;
  onMessage?: (message: Message) => void;
}

export interface ApiResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}