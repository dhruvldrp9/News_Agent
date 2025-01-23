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
    const chatWindow = document.getElementById('chatWindow');

    // Scroll to bottom function
    function scrollToBottom() {
       
        requestAnimationFrame(() => {
            chatWindow.scrollTop = chatMessages.scrollHeight - chatWindow.clientHeight;
        });
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
    // themeSwitchBtn.addEventListener('click', () => {
    //     document.body.classList.toggle('dark-mode');
    //     themeSwitchBtn.querySelector('i').classList.toggle('fa-moon');
    //     themeSwitchBtn.querySelector('i').classList.toggle('fa-sun');
    // });

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
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let isRecognizing = false;
        let noSpeechTimeout;

        recognition.onstart = () => {
            isRecognizing = true;
            microphoneBtn.classList.add('active');
            
            // Set a timeout to check for no speech
            noSpeechTimeout = setTimeout(() => {
                if (isRecognizing) {
                    const errorMessageContainer = document.createElement('div');
                    errorMessageContainer.classList.add('message-container', 'bot-message-container');
                    errorMessageContainer.innerHTML = `
                        <div class="message-avatar bot-avatar">AI</div>
                        <div class="message bot-message">No speech detected. Please speak clearly or check your microphone.</div>
                    `;
                    chatMessages.appendChild(errorMessageContainer);
                    scrollToBottom();
                    
                    recognition.stop();
                }
            }, 5000); // 5 seconds timeout
        };

        recognition.onresult = (event) => {
            // Clear the no-speech timeout when speech is detected
            if (noSpeechTimeout) {
                clearTimeout(noSpeechTimeout);
            }

            const results = event.results;
            const last = results.length - 1;
            const transcript = results[last][0].transcript;

            // Only send the final result
            if (results[last].isFinal) {
                sendMessage(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            let errorMessage = 'An error occurred with speech recognition.';
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please speak clearly or check your microphone.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone was found. Ensure your microphone is connected.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Permission to use microphone was denied. Please check your browser settings.';
                    break;
            }

            const errorMessageContainer = document.createElement('div');
            errorMessageContainer.classList.add('message-container', 'bot-message-container');
            errorMessageContainer.innerHTML = `
                <div class="message-avatar bot-avatar">AI</div>
                <div class="message bot-message">${errorMessage}</div>
            `;
            chatMessages.appendChild(errorMessageContainer);
            scrollToBottom();

            microphoneBtn.classList.remove('active');
            isRecognizing = false;

            // Clear the timeout if an error occurs
            if (noSpeechTimeout) {
                clearTimeout(noSpeechTimeout);
            }
        };

        recognition.onend = () => {
            microphoneBtn.classList.remove('active');
            isRecognizing = false;

            // Clear the timeout when recognition ends
            if (noSpeechTimeout) {
                clearTimeout(noSpeechTimeout);
            }
        };

        microphoneBtn.addEventListener('click', () => {
            if (!isRecognizing) {
                recognition.start();
            } else {
                recognition.stop();
            }
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

            // Use nextTick to ensure DOM has updated before scrolling
            setTimeout(() => {
                scrollToBottom();
            }, 0);
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

            // Use nextTick to ensure DOM has updated before scrolling
            setTimeout(() => {
                scrollToBottom();
            }, 0);
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