import axios from 'axios';
import { Message, ApiResponse } from './types';

export class ChatBotService {
  private apiKey: string;
  private baseUrl = 'https://api.cursor.sh/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages: Message[]): Promise<string> {
    try {
      const response = await axios.post<ApiResponse>(
        this.baseUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0]?.message?.content || 'Извините, не удалось получить ответ.';
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      return 'Извините, произошла ошибка при обработке вашего запроса.';
    }
  }
}