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


    let audioElement = null;
    let isSpeaking = false;
    let isRecognizing = false;
    let isListeningMode = false;

    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    async function speakText(text) {
        try {
            // Stop recognition while speaking
            if (recognition && isRecognizing) {
                recognition.stop();
                isRecognizing = false;
            }

            // Stop any ongoing speech
            if (audioElement && !audioElement.paused) {
                audioElement.pause();
                URL.revokeObjectURL(audioElement.src); // Clean up old audio URL
                audioElement = null;
            }

            const response = await fetch('/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Failed to convert text to speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create new audio element
            audioElement = new Audio(audioUrl);
            
            audioElement.onplay = () => {
                isSpeaking = true;
                microphoneBtn.classList.add('speaking');
            };

            audioElement.onended = () => {
                isSpeaking = false;
                microphoneBtn.classList.remove('speaking');
                URL.revokeObjectURL(audioUrl);
                audioElement = null;

                // Only restart recognition if we're still in listening mode
                if (isListeningMode && recognition) {
                    recognition.start();
                    isRecognizing = true;
                }
            };

            audioElement.onerror = (error) => {
                console.error('Audio playback error:', error);
                isSpeaking = false;
                microphoneBtn.classList.remove('speaking');
                URL.revokeObjectURL(audioUrl);
                audioElement = null;

                // Restart recognition on error if in listening mode
                if (isListeningMode && recognition) {
                    recognition.start();
                    isRecognizing = true;
                }
            };

            await audioElement.play().catch(error => {
                console.error('Audio play error:', error);
                throw error;
            });

        } catch (error) {
            console.error('Error with text-to-speech:', error);
            isSpeaking = false;
            microphoneBtn.classList.remove('speaking');
            if (audioElement) {
                URL.revokeObjectURL(audioElement.src);
                audioElement = null;
            }

            // Restart recognition on error if in listening mode
            if (isListeningMode && recognition) {
                recognition.start();
                isRecognizing = true;
            }
        }
    }

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

    if (recognition) {
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isRecognizing = true;
            microphoneBtn.classList.add('active');
        };

        recognition.onresult = (event) => {
            const results = event.results;
            const last = results.length - 1;
            const transcript = results[last][0].transcript;

            if (results[last].isFinal && isListeningMode) {
                sendMessage(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecognizing = false;
            microphoneBtn.classList.remove('active');

            // Restart recognition on error if in listening mode
            if (isListeningMode && !isSpeaking) {
                recognition.start();
            }
        };

        recognition.onend = () => {
            isRecognizing = false;
            microphoneBtn.classList.remove('active');

            // Restart recognition if in listening mode and not speaking
            if (isListeningMode && !isSpeaking) {
                recognition.start();
            }
        };

        // Modified microphone button click handler
        microphoneBtn.addEventListener('click', () => {
            isListeningMode = !isListeningMode; // Toggle listening mode

            if (isListeningMode) {
                // Starting listening mode
                if (!isSpeaking) {
                    recognition.start();
                }
                microphoneBtn.classList.add('listening-mode');
            } else {
                // Stopping listening mode
                recognition.stop();
                microphoneBtn.classList.remove('listening-mode');
                if (audioElement) {
                    audioElement.pause();
                    URL.revokeObjectURL(audioElement.src);
                    audioElement = null;
                }
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

            if (isListeningMode) {
                speakText(data.response);
            }

            setTimeout(scrollToBottom, 0);
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