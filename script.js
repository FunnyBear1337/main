// Основная логика приложения
class InterviewAssistant {
    constructor() {
        this.currentInterview = null;
        this.interviewHistory = [];
        this.isRecording = false;
        this.recognition = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadInterviewHistory();
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Начало собеседования
        document.getElementById('start-interview').addEventListener('click', () => {
            this.startInterview();
        });

        // Завершение собеседования
        document.getElementById('end-interview').addEventListener('click', () => {
            this.endInterview();
        });

        // Отправка сообщения
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter в поле ввода
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Голосовой ввод
        document.getElementById('voice-input').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Кнопки подготовки
        document.querySelectorAll('.prep-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handlePreparationAction(e.target);
            });
        });
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('user-input').value = transcript;
                this.sendMessage();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isRecording = false;
                this.updateVoiceButton();
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.updateVoiceButton();
            };
        }
    }

    switchSection(sectionName) {
        // Убираем активный класс у всех секций и кнопок
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Активируем нужную секцию и кнопку
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    async startInterview() {
        const position = document.getElementById('position').value;
        const level = document.getElementById('level').value;
        const companyType = document.getElementById('company-type').value;

        // Показываем загрузку
        this.showLoadingModal();

        try {
            // Симуляция подготовки ИИ
            await this.sleep(2000);

            this.currentInterview = {
                id: Date.now(),
                position,
                level,
                companyType,
                startTime: new Date(),
                messages: [],
                status: 'active'
            };

            // Скрываем настройки и показываем чат
            document.querySelector('.interview-setup').style.display = 'none';
            document.getElementById('interview-chat').style.display = 'flex';

            // Включаем ввод
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-message');
            userInput.disabled = false;
            sendButton.disabled = false;

            // Первое сообщение от ИИ
            await this.sleep(500);
            this.addMessage('ai', 'Анна Петрова', this.getWelcomeMessage(position, level));

            // Задаем первый вопрос
            setTimeout(() => {
                this.askQuestion();
            }, 2000);

        } catch (error) {
            console.error('Error starting interview:', error);
        } finally {
            this.hideLoadingModal();
        }
    }

    endInterview() {
        if (this.currentInterview) {
            this.currentInterview.endTime = new Date();
            this.currentInterview.status = 'completed';
            
            // Сохраняем в историю
            this.interviewHistory.push(this.currentInterview);
            this.saveInterviewHistory();

            // Показываем результаты
            this.showInterviewResults();

            // Сбрасываем состояние
            this.resetInterviewState();
        }
    }

    resetInterviewState() {
        this.currentInterview = null;
        
        // Показываем настройки и скрываем чат
        document.querySelector('.interview-setup').style.display = 'block';
        document.getElementById('interview-chat').style.display = 'none';

        // Очищаем чат
        document.getElementById('chat-messages').innerHTML = '';

        // Отключаем ввод
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-message');
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.value = '';
    }

    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();

        if (!message || !this.currentInterview) return;

        // Добавляем сообщение пользователя
        this.addMessage('user', 'Вы', message);
        this.currentInterview.messages.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        userInput.value = '';

        // Показываем индикатор печати
        this.showTypingIndicator();

        // Симуляция обработки ИИ
        await this.sleep(1500 + Math.random() * 1000);

        this.hideTypingIndicator();

        // Генерируем ответ ИИ
        const aiResponse = await this.generateAIResponse(message);
        this.addMessage('ai', 'Анна Петрова', aiResponse);

        this.currentInterview.messages.push({
            type: 'ai',
            content: aiResponse,
            timestamp: new Date()
        });

        // Задаем следующий вопрос через некоторое время
        if (this.currentInterview.messages.filter(m => m.type === 'ai').length < 8) {
            setTimeout(() => {
                this.askQuestion();
            }, 3000);
        } else {
            setTimeout(() => {
                this.addMessage('ai', 'Анна Петрова', 'Спасибо за ваши ответы! Это все вопросы, которые у меня были. Через несколько дней мы свяжемся с вами. Хорошего дня!');
                setTimeout(() => {
                    this.endInterview();
                }, 2000);
            }, 2000);
        }
    }

    addMessage(type, sender, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        messageElement.innerHTML = `
            <div class="sender">${sender}</div>
            <div class="content">${content}</div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>Анна печатает...</span>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async askQuestion() {
        if (!this.currentInterview) return;

        this.showTypingIndicator();
        await this.sleep(1000);
        this.hideTypingIndicator();

        const question = this.getNextQuestion();
        this.addMessage('ai', 'Анна Петрова', question);

        this.currentInterview.messages.push({
            type: 'ai',
            content: question,
            timestamp: new Date()
        });
    }

    getWelcomeMessage(position, level) {
        const positionNames = {
            'frontend': 'Frontend разработчика',
            'backend': 'Backend разработчика',
            'fullstack': 'Fullstack разработчика',
            'devops': 'DevOps инженера',
            'qa': 'QA инженера',
            'pm': 'Project Manager',
            'analyst': 'Системного аналитика',
            'designer': 'UI/UX дизайнера'
        };

        const levelNames = {
            'junior': 'Junior',
            'middle': 'Middle',
            'senior': 'Senior',
            'lead': 'Lead'
        };

        return `Добро пожаловать! Меня зовут Анна Петрова, я Senior HR Manager. Сегодня мы проводим собеседование на позицию ${levelNames[level]} ${positionNames[position]}. Давайте начнем с знакомства. Расскажите немного о себе и своем опыте работы.`;
    }

    getNextQuestion() {
        const questions = {
            technical: [
                'Расскажите о самом сложном проекте, над которым вы работали. Какие технические сложности возникали и как вы их решали?',
                'Как вы подходите к изучению новых технологий? Приведите пример недавно изученной технологии.',
                'Опишите ваш процесс дебаггинга. Какие инструменты вы используете?',
                'Как вы обеспечиваете качество своего кода? Какие практики используете?',
                'Расскажите о времени, когда вам пришлось оптимизировать производительность приложения.'
            ],
            behavioral: [
                'Расскажите о ситуации, когда вы не согласились с решением команды. Как вы поступили?',
                'Приведите пример, когда вам пришлось работать с очень сжатыми сроками. Как вы справились?',
                'Как вы обычно реагируете на критику своей работы?',
                'Расскажите о времени, когда вы помогли коллеге решить сложную задачу.',
                'Что мотивирует вас в работе? Что вас демотивирует?'
            ],
            company: [
                'Почему вы хотите работать именно в нашей компании?',
                'Что вы знаете о нашей компании и продуктах?',
                'Какие у вас есть вопросы о компании или позиции?',
                'Какие ваши карьерные планы на ближайшие 2-3 года?'
            ]
        };

        const allQuestions = [...questions.technical, ...questions.behavioral, ...questions.company];
        return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    }

    async generateAIResponse(userMessage) {
        // Симуляция ИИ ответа на основе сообщения пользователя
        const responses = [
            'Интересно! Можете рассказать об этом подробнее?',
            'Понятно. А какие технологии вы использовали в этом проекте?',
            'Хорошо. А как команда отреагировала на ваше решение?',
            'Отлично! А что было самым сложным в этой ситуации?',
            'Спасибо за подробный ответ. Это ценный опыт.',
            'Понимаю. А как вы думаете, что можно было бы сделать по-другому?',
            'Интересный подход! А использовали ли вы какие-то конкретные методологии?',
            'Хорошо. А как вы измеряли успех этого решения?'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
            this.isRecording = true;
            this.updateVoiceButton();
        }
    }

    updateVoiceButton() {
        const voiceButton = document.getElementById('voice-input');
        const icon = voiceButton.querySelector('i');
        
        if (this.isRecording) {
            icon.className = 'fas fa-stop';
            voiceButton.classList.add('recording');
        } else {
            icon.className = 'fas fa-microphone';
            voiceButton.classList.remove('recording');
        }
    }

    handlePreparationAction(button) {
        const card = button.closest('.prep-card');
        const title = card.querySelector('h3').textContent;
        
        // Здесь можно добавить конкретную логику для каждой карточки
        alert(`Функция "${title}" будет доступна в полной версии приложения`);
    }

    showInterviewResults() {
        // Переключаемся на секцию обратной связи
        this.switchSection('feedback');
        
        const feedbackContent = document.querySelector('.feedback-content');
        feedbackContent.innerHTML = this.generateFeedbackHTML();
    }

    generateFeedbackHTML() {
        const interview = this.currentInterview;
        const duration = Math.round((interview.endTime - interview.startTime) / 1000 / 60);
        const messageCount = interview.messages.filter(m => m.type === 'user').length;

        return `
            <div class="interview-result">
                <div class="result-header">
                    <h3>Результаты собеседования</h3>
                    <p>Позиция: ${interview.position} (${interview.level})</p>
                    <p>Дата: ${interview.startTime.toLocaleDateString('ru-RU')}</p>
                    <p>Продолжительность: ${duration} мин</p>
                </div>
                
                <div class="result-stats">
                    <div class="stat-card">
                        <h4>Активность</h4>
                        <div class="stat-value">${messageCount}</div>
                        <p>ответов дано</p>
                    </div>
                    
                    <div class="stat-card">
                        <h4>Общая оценка</h4>
                        <div class="stat-value">7.5/10</div>
                        <p>хороший результат</p>
                    </div>
                    
                    <div class="stat-card">
                        <h4>Коммуникация</h4>
                        <div class="stat-value">8/10</div>
                        <p>отличная подача</p>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>Рекомендации для улучшения:</h4>
                    <ul>
                        <li>Подготовьте больше конкретных примеров из вашего опыта</li>
                        <li>Изучите подробнее технологический стек компании</li>
                        <li>Подготовьте вопросы о команде и процессах разработки</li>
                        <li>Попрактикуйтесь в рассказе о своих достижениях с цифрами</li>
                    </ul>
                </div>
                
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="interviewAssistant.startNewInterview()">
                        <i class="fas fa-redo"></i>
                        Пройти еще раз
                    </button>
                    <button class="btn btn-outline" onclick="interviewAssistant.downloadReport()">
                        <i class="fas fa-download"></i>
                        Скачать отчет
                    </button>
                </div>
            </div>
        `;
    }

    startNewInterview() {
        this.switchSection('interview');
        this.resetInterviewState();
    }

    downloadReport() {
        alert('Функция скачивания отчета будет доступна в полной версии');
    }

    showLoadingModal() {
        document.getElementById('loading-modal').classList.add('active');
    }

    hideLoadingModal() {
        document.getElementById('loading-modal').classList.remove('active');
    }

    saveInterviewHistory() {
        localStorage.setItem('interviewHistory', JSON.stringify(this.interviewHistory));
    }

    loadInterviewHistory() {
        const saved = localStorage.getItem('interviewHistory');
        if (saved) {
            this.interviewHistory = JSON.parse(saved);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Дополнительные стили для результатов (добавляем динамически)
const additionalStyles = `
    .interview-result {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
    }
    
    .result-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .result-header h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 1rem;
    }
    
    .result-header p {
        color: #6b7280;
        margin: 0.25rem 0;
    }
    
    .result-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .stat-card {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 0.5rem;
        text-align: center;
        border: 1px solid #e5e7eb;
    }
    
    .stat-card h4 {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #667eea;
        margin-bottom: 0.25rem;
    }
    
    .stat-card p {
        font-size: 0.875rem;
        color: #6b7280;
    }
    
    .recommendations {
        margin-bottom: 2rem;
    }
    
    .recommendations h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 1rem;
    }
    
    .recommendations ul {
        list-style: none;
        padding: 0;
    }
    
    .recommendations li {
        padding: 0.75rem 0;
        border-bottom: 1px solid #f3f4f6;
        position: relative;
        padding-left: 1.5rem;
        color: #374151;
    }
    
    .recommendations li:before {
        content: "→";
        position: absolute;
        left: 0;
        color: #667eea;
        font-weight: bold;
    }
    
    .result-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .btn.recording {
        background: #ef4444 !important;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @media (max-width: 768px) {
        .result-actions {
            flex-direction: column;
        }
        
        .result-stats {
            grid-template-columns: 1fr;
        }
    }
`;

// Добавляем дополнительные стили
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Инициализация приложения
let interviewAssistant;

document.addEventListener('DOMContentLoaded', () => {
    interviewAssistant = new InterviewAssistant();
});