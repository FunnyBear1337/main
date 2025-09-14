import React from 'react';
import { ChatBot } from './components/ChatBot';
import { Message } from './types';
import './App.css';

function App() {
  const handleMessage = (message: Message) => {
    console.log('Новое сообщение:', message);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React AI ChatBot</h1>
        <p>Пример интеграции AI бота на React TypeScript</p>
      </header>
      
      <main className="App-main">
        <div className="demo-content">
          <h2>Добро пожаловать!</h2>
          <p>
            Это демонстрация AI чат-бота, интегрированного в React приложение.
            Бот использует API Cursor для генерации ответов.
          </p>
          <div className="features">
            <div className="feature">
              <h3>🤖 Умные ответы</h3>
              <p>Использует современные AI модели для генерации контекстных ответов</p>
            </div>
            <div className="feature">
              <h3>💬 Интуитивный интерфейс</h3>
              <p>Современный и отзывчивый дизайн с анимациями</p>
            </div>
            <div className="feature">
              <h3>📱 Адаптивность</h3>
              <p>Отлично работает на всех устройствах</p>
            </div>
          </div>
        </div>
      </main>

      {/* AI ChatBot */}
      <ChatBot
        apiKey="key_2c860a81556f38bb95fb276fedd307980ffc0d607aa05a5ebb6a9b40677347b2"
        title="AI Помощник"
        placeholder="Задайте любой вопрос..."
        onMessage={handleMessage}
      />
    </div>
  );
}

export default App;