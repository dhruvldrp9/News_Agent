document.addEventListener('DOMContentLoaded', () => {
    const microphoneBtn = document.getElementById('microphoneBtn');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const sessionId = document.getElementById('sessionId').value;
    const newChatBtn = document.getElementById('newChatBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.close-btn');
    const themeSwitchBtn = document.getElementById('themeSwitchBtn');

    // Scroll to bottom function
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Initial scroll to bottom
    scrollToBottom();

    // New Chat functionality
    newChatBtn.addEventListener('click', () => {
        // Clear chat messages
        chatMessages.innerHTML = `
            <div class="message-container bot-message-container">
                <div class="message-avatar bot-avatar">AI</div>
                <div class="message bot-message">
                    Hi! I'm Nova, your AI assistant. How can I help you today?
                </div>
            </div>
        `;
        scrollToBottom();
    });

    // Theme switching
    themeSwitchBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeSwitchBtn.querySelector('i').classList.toggle('fa-moon');
        themeSwitchBtn.querySelector('i').classList.toggle('fa-sun');
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            microphoneBtn.classList.add('active');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage(transcript);
        };

        recognition.onend = () => {
            microphoneBtn.classList.remove('active');
        };

        microphoneBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        microphoneBtn.disabled = true;
    }

    // Send message functionality
    function sendMessage(message) {
        if (message.trim() === '') return;

        // Create user message element
        const userMessageContainer = document.createElement('div');
        userMessageContainer.classList.add('message-container', 'user-message-container');
        userMessageContainer.innerHTML = `
            <div class="message-avatar user-avatar">U</div>
            <div class="message user-message">${message}</div>
        `;
        chatMessages.appendChild(userMessageContainer);

        // Scroll to bottom
        scrollToBottom();

        // Clear input
        userInput.value = '';

        // Send message to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                session_id: sessionId 
            })
        })
        .then(response => response.json())
        .then(data => {
            // Create bot message element
            const botMessageContainer = document.createElement('div');
            botMessageContainer.classList.add('message-container', 'bot-message-container');
            botMessageContainer.innerHTML = `
                <div class="message-avatar bot-avatar">AI</div>
                <div class="message bot-message">${data.response}</div>
            `;
            chatMessages.appendChild(botMessageContainer);

            // Scroll to bottom
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessageContainer = document.createElement('div');
            errorMessageContainer.classList.add('message-container', 'bot-message-container');
            errorMessageContainer.innerHTML = `
                <div class="message-avatar bot-avatar">AI</div>
                <div class="message bot-message">Sorry, something went wrong.</div>
            `;
            chatMessages.appendChild(errorMessageContainer);

            // Scroll to bottom
            scrollToBottom();
        });
    }

    // Send button click handler
    sendBtn.addEventListener('click', () => {
        sendMessage(userInput.value);
    });

    // Enter key handler for input
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(userInput.value);
        }
    });
});