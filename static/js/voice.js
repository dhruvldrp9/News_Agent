document.addEventListener('DOMContentLoaded', function() {
    const voiceButton = document.getElementById('voiceButton');
    const audioWaves = document.getElementById('audioWaves');
    const statusText = document.getElementById('statusText');
    const statusSubtext = document.getElementById('statusSubtext');
    const transcriptText = document.getElementById('currentTranscript');
    const responseText = document.getElementById('assistantResponse');
    const chatHistory = document.getElementById('chatHistory');
    const newsRegionSelect = document.getElementById('newsRegion');
    const newChatBtn = document.getElementById('newChatBtn');
    const ttsAudio = document.getElementById('ttsAudio');

    let isListening = false;
    let isSpeaking = false;
    let isProcessing = false;
    let recognition = null;
    let currentSessionId = localStorage.getItem('currentSessionId') || '';

    // Initialize speech recognition
    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                isListening = true;
                updateVoiceState('listening');
                updateStatus('Listening...', 'Speak now, I\'m listening to your question');
                transcriptText.textContent = 'Listening...';
            };

            recognition.onresult = function(event) {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    } else {
                        const interimTranscript = event.results[i][0].transcript;
                        transcriptText.textContent = interimTranscript;
                    }
                }

                if (transcript) {
                    transcriptText.textContent = transcript;
                    processVoiceInput(transcript);
                }
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                resetVoiceState();
                updateStatus('Error occurred', 'Please try again or check your microphone');
                transcriptText.textContent = 'Error: Could not recognize speech. Please try again.';
            };

            recognition.onend = function() {
                if (isListening && !isProcessing) {
                    resetVoiceState();
                    updateStatus('Tap to start voice conversation', 'Your AI voice assistant is ready to help');
                }
            };
        } else {
            updateStatus('Speech not supported', 'Your browser doesn\'t support speech recognition');
            voiceButton.disabled = true;
        }
    }

    // Update voice state with animations
    function updateVoiceState(state) {
        voiceButton.className = 'voice-button';
        audioWaves.className = 'audio-waves';

        if (state) {
            voiceButton.classList.add(state);
            audioWaves.classList.add(state);
        }
    }

    // Reset voice state
    function resetVoiceState() {
        isListening = false;
        isSpeaking = false;
        isProcessing = false;
        updateVoiceState();
    }

    // Update status text
    function updateStatus(main, sub) {
        statusText.innerHTML = `<i class="fas fa-microphone-alt"></i> ${main}`;
        statusSubtext.textContent = sub;
    }

    // Process voice input
    async function processVoiceInput(transcript) {
        try {
            isListening = false;
            isProcessing = true;
            updateVoiceState('processing');
            updateStatus('Processing...', 'Analyzing your question and fetching news');

            responseText.textContent = 'Processing your request...';

            // Create new session if none exists
            if (!currentSessionId) {
                await createNewVoiceSession();
            }

            const newsRegion = newsRegionSelect ? newsRegionSelect.value : 'global';

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    message: transcript,
                    session_id: currentSessionId,
                    news_region: newsRegion
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();

            if (data.response) {
                responseText.textContent = data.response;

                // Convert response to speech
                await speakResponse(data.response);

                // Load updated chat history
                loadChatHistory();
            } else {
                throw new Error('No response received');
            }

        } catch (error) {
            console.error('Error processing voice input:', error);
            isProcessing = false;
            
            // Continue listening even after errors
            updateStatus('Listening...', 'Error processed, ready for next question');
            transcriptText.textContent = 'Listening...';
            responseText.textContent = 'Sorry, I encountered an error processing your request.';
            
            // Start listening again automatically
            if (recognition && !isListening) {
                recognition.start();
            }
        }
    }

    // Speak response using TTS
    async function speakResponse(text) {
        try {
            isSpeaking = true;
            updateVoiceState('speaking');
            updateStatus('Speaking...', 'Playing the response audio');

            const response = await fetch('/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ 
                    text: text,
                    session_id: currentSessionId 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate speech');
            }

            const data = await response.json();

            if (data.success && data.audio_url) {
                // Clear any existing audio source
                ttsAudio.src = '';

                // Set new audio source with cache busting
                const audioUrl = data.audio_url + '?t=' + Date.now();
                ttsAudio.src = audioUrl;

                ttsAudio.onloadeddata = function() {
                    console.log('Audio loaded successfully');
                };

                ttsAudio.onended = function() {
                    isSpeaking = false;
                    isProcessing = false;
                    
                    // Continue listening automatically instead of resetting
                    updateStatus('Listening...', 'Ready for your next question');
                    transcriptText.textContent = 'Listening...';
                    responseText.textContent = '';
                    
                    // Start listening again automatically
                    if (recognition && !isListening) {
                        recognition.start();
                    }
                };

                ttsAudio.onerror = function(e) {
                    console.error('Audio playback error:', e);
                    isSpeaking = false;
                    isProcessing = false;
                    
                    // Continue listening even if audio fails
                    updateStatus('Listening...', 'Audio error, but ready for next question');
                    transcriptText.textContent = 'Listening...';
                    
                    // Start listening again automatically
                    if (recognition && !isListening) {
                        recognition.start();
                    }
                };

                // Load and play the audio
                ttsAudio.load();
                await ttsAudio.play();
            } else {
                throw new Error('No audio URL received from server');
            }

        } catch (error) {
            console.error('Error with text-to-speech:', error);
            isSpeaking = false;
            isProcessing = false;
            
            // Continue listening even if TTS fails
            updateStatus('Listening...', 'TTS error, but ready for next question');
            transcriptText.textContent = 'Listening...';
            
            // Start listening again automatically
            if (recognition && !isListening) {
                recognition.start();
            }
        }
    }

    // Create new voice session
    async function createNewVoiceSession() {
        try {
            const response = await fetch('/chat/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Failed to create new session');
            }

            const data = await response.json();
            if (data.session_id) {
                currentSessionId = data.session_id;
                localStorage.setItem('currentSessionId', currentSessionId);
            }
        } catch (error) {
            console.error('Error creating new session:', error);
        }
    }

    // Load chat history
    function loadChatHistory() {
        fetch('/chat/history', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.history) {
                displayChatHistory(data.history);
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
        });
    }

    // Display chat history
    function displayChatHistory(history) {
        if (history && history.length > 0) {
            chatHistory.innerHTML = history.map(chat => {
                const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
                const preview = firstUserMessage ? firstUserMessage.content : 'New Conversation';
                const date = new Date(chat.created_at).toLocaleDateString();
                const time = new Date(chat.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isActive = chat.session_id === currentSessionId;

                return `
                    <div class="chat-history-item ${isActive ? 'active' : ''}" data-session-id="${chat.session_id}">
                        <div class="chat-history-preview">${preview.substring(0, 60)}${preview.length > 60 ? '...' : ''}</div>
                        <div class="chat-history-date">
                            <i class="fas fa-clock"></i>
                            ${date} • ${time}
                        </div>
                    </div>
                `;
            }).join('');

            // Add click listeners
            document.querySelectorAll('.chat-history-item').forEach(item => {
                item.addEventListener('click', function() {
                    const sessionId = this.dataset.sessionId;
                    currentSessionId = sessionId;
                    localStorage.setItem('currentSessionId', sessionId);
                    loadChatHistory(); // Refresh to update active state
                });
            });
        } else {
            chatHistory.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-microphone" style="font-size: 2rem; margin-bottom: 1rem; color: var(--accent-cyan);"></i>
                    <p>No voice conversations yet</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Start talking to create your history!</p>
                </div>
            `;
        }
    }

    // Voice button click handler - now acts as toggle for continuous listening
    voiceButton.addEventListener('click', function() {
        if (!recognition) {
            updateStatus('Speech not supported', 'Your browser doesn\'t support speech recognition');
            return;
        }

        if (isListening || isSpeaking || isProcessing) {
            // Stop everything - user wants to end the conversation
            if (isListening) recognition.stop();
            if (isSpeaking) {
                ttsAudio.pause();
                ttsAudio.currentTime = 0;
            }
            resetVoiceState();
            updateStatus('Tap to start voice conversation', 'Your AI voice assistant is ready to help');
            transcriptText.textContent = '';
            responseText.textContent = '';
        } else {
            // Start continuous listening mode
            transcriptText.textContent = '';
            responseText.textContent = '';
            recognition.start();
        }
    });

    // New chat button handler
    if (newChatBtn) {
        newChatBtn.addEventListener('click', async function() {
            await createNewVoiceSession();
            loadChatHistory();
            transcriptText.textContent = '';
            responseText.textContent = '';
            resetVoiceState();
            updateStatus('New conversation started', 'Tap to start voice conversation');
        });
    }

    // Initialize everything
    initializeSpeechRecognition();
    loadChatHistory();

    // Create session if none exists
    if (!currentSessionId) {
        createNewVoiceSession();
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Spacebar to toggle voice
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            voiceButton.click();
        }

        // Escape to stop everything
        if (e.key === 'Escape') {
            if (isListening) recognition.stop();
            if (isSpeaking) {
                ttsAudio.pause();
                ttsAudio.currentTime = 0;
            }
            resetVoiceState();
            updateStatus('Stopped', 'Tap to start voice conversation');
        }
    });
});