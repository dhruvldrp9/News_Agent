document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const micButton = document.getElementById('micButton');
    const clearAllChatsBtn = document.getElementById('clearAllChatsBtn');

    let currentSessionId = localStorage.getItem('currentSessionId') || '';

    // Initialize with better error handling
    initializeChat();

    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }

    // Handle Enter key and auto-resize
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Enhanced placeholder animation
        messageInput.addEventListener('focus', function() {
            this.style.borderColor = 'var(--accent-cyan)';
            this.style.boxShadow = 'var(--glow-cyan)';
        });

        messageInput.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = 'var(--border-primary)';
                this.style.boxShadow = 'none';
            }
        });
    }

    // New Chat button functionality
    if (newChatBtn && chatMessages) {
        newChatBtn.addEventListener('click', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            createNewChat();
        });
    }

    // Clear All Chats button functionality
    if (clearAllChatsBtn) {
        clearAllChatsBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                clearAllChats();
            }
        });
    }

    async function initializeChat() {
        try {
            showLoadingState();
            
            // First, try to load chat history to check authentication
            const historyResponse = await fetch('/chat/history', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (!historyResponse.ok) {
                if (historyResponse.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                console.warn('Failed to load chat history, continuing without history');
                // Don't throw error, continue with empty history
                const historyData = { history: [] };
                displayChatHistory([]);
                await createNewChatSilent();
                return;
            }

            const historyData = await historyResponse.json();
            
            // Display chat history first
            displayChatHistory(historyData.history || []);

            // Handle current session
            if (!currentSessionId) {
                // Create new session only if no history exists
                if (!historyData.history || historyData.history.length === 0) {
                    await createNewChatSilent();
                } else {
                    // Use the most recent session if available
                    const mostRecent = historyData.history[0];
                    if (mostRecent) {
                        currentSessionId = mostRecent.session_id;
                        localStorage.setItem('currentSessionId', currentSessionId);
                        loadChatSessionFromData(mostRecent);
                    } else {
                        await createNewChatSilent();
                    }
                }
            } else {
                // Load existing session from history data
                const existingSession = historyData.history?.find(chat => chat.session_id === currentSessionId);
                if (existingSession) {
                    loadChatSessionFromData(existingSession);
                } else {
                    // Session doesn't exist, create new one
                    await createNewChatSilent();
                }
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            showErrorMessage('Failed to initialize chat. Please refresh the page.');
        } finally {
            hideLoadingState();
        }
    }

    function loadChatSessionFromData(chatData) {
        currentSessionId = chatData.session_id;
        localStorage.setItem('currentSessionId', currentSessionId);
        
        // Clear current messages
        chatMessages.innerHTML = '';
        
        if (chatData.messages && chatData.messages.length > 0) {
            chatData.messages.forEach((message, index) => {
                setTimeout(() => {
                    addMessageToChat(message.role, message.content);
                    if (index === chatData.messages.length - 1) {
                        setTimeout(() => scrollToBottom(), 200);
                    }
                }, index * 50); // Faster staggered animation
            });
        } else {
            showWelcomeMessage();
        }
        
        // Update active state in sidebar
        updateActiveChat(currentSessionId);
    }

    async function createNewChatSilent() {
        try {
            const response = await fetch('/chat/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to create new chat');
            }

            const data = await response.json();
            if (data && data.session_id) {
                currentSessionId = data.session_id;
                localStorage.setItem('currentSessionId', currentSessionId);
                chatMessages.innerHTML = '';
                showWelcomeMessage();
                setTimeout(() => scrollToBottom(), 100);
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
            showErrorMessage('Failed to create new chat. Please try again.');
        }
    }

    function clearAllChats() {
        showLoadingState();

        fetch('/chat/clear-all', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to clear chat history');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                // Clear current session
                currentSessionId = '';
                localStorage.removeItem('currentSessionId');

                // Clear the chat messages
                chatMessages.innerHTML = '';

                // Show welcome message
                showWelcomeMessage();

                // Reload chat history to update sidebar
                loadChatHistory();

                showSuccessMessage('All chat history has been cleared successfully.');
            }
        })
        .catch(error => {
            console.error('Error clearing chat history:', error);
            showErrorMessage('Failed to clear chat history. Please try again.');
        })
        .finally(() => {
            hideLoadingState();
        });
    }

    function deleteSpecificChat(sessionId) {
        fetch('/chat/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ session_id: sessionId })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to delete chat');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                // If we deleted the current session, create a new one
                if (sessionId === currentSessionId) {
                    createNewChat();
                } else {
                    // Just reload the chat history
                    loadChatHistory();
                }

                showSuccessMessage('Chat deleted successfully.');
            }
        })
        .catch(error => {
            console.error('Error deleting chat:', error);
            showErrorMessage('Failed to delete chat. Please try again.');
        });
    }

    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'message success-message animate-slide-in';
        successDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <i class="fas fa-check-circle"></i>
                    <span class="message-sender">System</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
        `;
        chatMessages.appendChild(successDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Auto-remove success message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    function createNewChat() {
        showLoadingState();

        fetch('/chat/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to create new chat');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.session_id) {
                currentSessionId = data.session_id;
                localStorage.setItem('currentSessionId', currentSessionId);

                // Clear the chat messages completely
                chatMessages.innerHTML = '';

                // Show welcome message for the new chat
                showWelcomeMessage();

                // Reload chat history to update sidebar
                loadChatHistory();

                // Scroll to bottom
                setTimeout(() => scrollToBottom(), 100);
            }
        })
        .catch(error => {
            console.error('Error creating new chat:', error);
            showErrorMessage('Failed to create new chat. Please try again.');
        })
        .finally(() => {
            hideLoadingState();
        });
    }

    function showLoadingState() {
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-satellite-dish loading"></i> Processing...';
        }
    }

    function hideLoadingState() {
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    function showWelcomeMessage() {
        const newsRegion = document.getElementById('newsRegion').value;
        const isIndia = newsRegion === 'india';

        const welcomeMessage = `
            <div class="welcome-message animate-slide-in">
                <h2 class="text-gradient glow-text">
                    <i class="fas fa-robot"></i>
                    Welcome to News Agent
                </h2>
                <p>Your AI-powered news companion is ready to assist you with the latest information from around the world.</p>
                <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary welcome-prompt-btn" data-prompt="Show me the latest news headlines" data-region="${newsRegion}">
                        <i class="fas fa-newspaper"></i>
                        Latest News
                    </button>
                    <button class="btn btn-secondary welcome-prompt-btn" data-prompt="Give me market updates and financial news" data-region="${newsRegion}">
                        <i class="fas fa-chart-line"></i>
                        Market Updates
                    </button>
                    <button class="btn btn-secondary welcome-prompt-btn" data-prompt="What are the current ${isIndia ? 'Indian' : 'global'} events and world news?" data-region="${isIndia ? 'india' : 'global'}">
                        <i class="fas fa-${isIndia ? 'flag' : 'globe'}"></i>
                        ${isIndia ? 'India News' : 'Global Events'}
                    </button>
                </div>
            </div>
        `;

        // Clear messages and add welcome message
        chatMessages.innerHTML = welcomeMessage;

        // Add click event listeners to the welcome prompt buttons
        setTimeout(() => {
            document.querySelectorAll('.welcome-prompt-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const prompt = this.dataset.prompt;
                    const region = this.dataset.region;

                    // Update the news region dropdown to match the button's region
                    document.getElementById('newsRegion').value = region;

                    // Add visual feedback
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);

                    // Set the prompt in the input and send it
                    if (messageInput) {
                        messageInput.value = prompt;
                        messageInput.focus();
                        // Trigger the form submission
                        handleChatSubmit(new Event('submit'));
                    }
                });
            });
        }, 100);
    }

    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error-message animate-slide-in';
        errorDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span class="message-sender">System Error</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="message-text">${message}</div>
            </div>
        `;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function loadChatHistory() {
        fetch('/chat/history', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Failed to load chat history');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.history) {
                displayChatHistory(data.history);
            } else {
                displayChatHistory([]);
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            displayChatHistory([]);
        });
    }

    function loadChatSession(sessionId) {
        currentSessionId = sessionId;
        localStorage.setItem('currentSessionId', sessionId);

        // Clear current messages
        chatMessages.innerHTML = '';
        showLoadingState();

        // Load messages for this session
        fetch('/chat/history', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chat session');
            }
            return response.json();
        })
        .then(data => {
            const chat = data.history.find(c => c.session_id === sessionId);
            if (chat && chat.messages && chat.messages.length > 0) {
                chat.messages.forEach((message, index) => {
                    setTimeout(() => {
                        addMessageToChat(message.role, message.content);
                        // Auto-scroll after the last message is added
                        if (index === chat.messages.length - 1) {
                            setTimeout(() => scrollToBottom(), 200);
                        }
                    }, index * 100); // Staggered animation
                });
            } else {
                showWelcomeMessage();
            }
            // Update active state in sidebar
            updateActiveChat(sessionId);
        })
        .catch(error => {
            console.error('Error loading chat session:', error);
            showWelcomeMessage();
        })
        .finally(() => {
            hideLoadingState();
        });
    }

    function updateActiveChat(sessionId) {
        document.querySelectorAll('.chat-history-item').forEach(item => {
            item.classList.toggle('active', item.dataset.sessionId === sessionId);
        });
    }

    // Enhanced Speech Recognition
    let recognition = null;
    let isListening = false;

    function initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                isListening = true;
                if (micButton) {
                    micButton.classList.add('listening');
                    micButton.innerHTML = '<i class="fas fa-stop"></i>';
                    micButton.title = 'Stop listening';
                }
            };

            recognition.onresult = function(event) {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }

                if (messageInput && transcript) {
                    messageInput.value = transcript;
                    messageInput.focus();
                    // Auto resize textarea
                    messageInput.style.height = 'auto';
                    messageInput.style.height = messageInput.scrollHeight + 'px';
                }
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                stopListening();
                showErrorMessage('Speech recognition failed. Please try again or type your message.');
            };

            recognition.onend = function() {
                stopListening();
            };
        }
    }

    function startListening() {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                showErrorMessage('Could not start voice input. Please try again.');
            }
        }
    }

    function stopListening() {
        isListening = false;
        if (micButton) {
            micButton.classList.remove('listening');
            micButton.innerHTML = '<i class="fas fa-microphone"></i>';
            micButton.title = 'Voice Input';
        }
        if (recognition) {
            recognition.stop();
        }
    }

    function toggleListening() {
        if (!recognition) {
            showErrorMessage('Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge.');
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    // Initialize speech recognition
    initializeSpeechRecognition();

    // Add event listener for microphone button
    if (micButton) {
        micButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Add visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            toggleListening();
        });
    }

    function handleChatSubmit(event) {
        event.preventDefault();

        const message = messageInput.value.trim();
        if (!message) return;

        // Show loading state
        showLoadingState();
        messageInput.disabled = true;

        // Add user message to chat
        addMessageToChat('user', message);

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Send message to server
        const newsRegionSelect = document.getElementById('newsRegion');
        const newsRegion = newsRegionSelect ? newsRegionSelect.value : 'global';

        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ 
                message: message,
                session_id: currentSessionId,
                news_region: newsRegion
            })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return Promise.reject(new Error('Authentication required'));
                }
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'An error occurred');
                    });
                } else {
                    throw new Error('Server returned unexpected response');
                }
            }
            return response.json();
        })
        .then(data => {
            if (data.response) {
                setTimeout(() => {
                    addMessageToChat('assistant', data.response);
                    loadChatHistory();
                    // Force multiple scroll attempts to ensure it works
                    scrollToBottom();
                    setTimeout(scrollToBottom, 100);
                    setTimeout(scrollToBottom, 300);
                }, 500); // Slight delay for better UX
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage(error.message || 'An error occurred while processing your message.');
            if (error.message.includes('not authenticated')) {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            }
        })
        .finally(() => {
            // Re-enable input and button
            hideLoadingState();
            messageInput.disabled = false;
            messageInput.focus();
        });
    }

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message animate-slide-in`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const timestamp = new Date().toLocaleTimeString();
        const currentTime = new Date().toLocaleDateString();

        let iconClass, senderName;
        if (role === 'user') {
            iconClass = 'fas fa-user-astronaut';
            senderName = 'You';
        } else if (role === 'assistant') {
            iconClass = 'fas fa-robot';
            senderName = 'News Agent';
        } else if (role === 'error') {
            iconClass = 'fas fa-exclamation-triangle';
            senderName = 'System Error';
        }

        messageContent.innerHTML = `
            <div class="message-header">
                <i class="${iconClass}"></i>
                <span class="message-sender">${senderName}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-text">${content}</div>
        `;

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Immediate scroll to bottom
        scrollToBottom();
    }

    function scrollToBottom() {
        // Force immediate scroll without animation for reliability
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Also force scroll after a brief delay to handle any layout changes
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }

    function displayChatHistory(history) {
        if (history && history.length > 0) {
            chatHistory.innerHTML = history.map(chat => {
                const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
                const preview = firstUserMessage ? firstUserMessage.content : 'New Conversation';
                const date = new Date(chat.created_at).toLocaleDateString();
                const time = new Date(chat.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isActive = chat.session_id === localStorage.getItem('currentSessionId');

                return `
                    <div class="chat-history-item ${isActive ? 'active' : ''} animate-slide-in" data-session-id="${chat.session_id}">
                        <div class="chat-history-preview">${preview.substring(0, 50)}${preview.length > 50 ? '...' : ''}</div>
                        <div class="chat-history-date">
                            <i class="fas fa-clock"></i>
                            ${date} • ${time}
                        </div>
                        <button class="delete-chat-btn" data-session-id="${chat.session_id}" title="Delete this chat">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }).join('');

            // Add click listeners for chat items
            document.querySelectorAll('.chat-history-item').forEach(item => {
                item.addEventListener('click', function (e) {
                    // Don't trigger if delete button was clicked
                    if (e.target.closest('.delete-chat-btn')) {
                        return;
                    }

                    // Visual feedback
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);

                    const sessionId = this.dataset.sessionId;
                    loadChatSession(sessionId);
                });
            });

            // Add click listeners for delete buttons
            document.querySelectorAll('.delete-chat-btn').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent chat item click

                    const sessionId = this.dataset.sessionId;
                    const chatItem = this.closest('.chat-history-item');
                    const preview = chatItem.querySelector('.chat-history-preview').textContent;

                    if (confirm(`Are you sure you want to delete this chat?\n\n"${preview}"\n\nThis action cannot be undone.`)) {
                        // Add visual feedback
                        this.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                        deleteSpecificChat(sessionId);
                    }
                });
            });
        } else {
            chatHistory.innerHTML = `
                <div class="no-history animate-fade-in">
                    <i class="fas fa-comment-dots" style="font-size: 2rem; margin-bottom: 1rem; color: var(--accent-cyan);"></i>
                    <p>No conversations yet</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Start chatting to see your history here!</p>
                </div>
            `;
        }
    }

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to send message
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (messageInput.value.trim()) {
                handleChatSubmit(e);
            }
        }

        // Escape to stop voice input
        if (e.key === 'Escape' && isListening) {
            stopListening();
        }
    });

    // Auto-focus message input when page loads
    if (messageInput) {
        messageInput.focus();
    }

    // Create an observer to auto-scroll when new content is added
    const chatObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if a message was added
                const hasNewMessage = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains('message')
                );
                if (hasNewMessage) {
                    setTimeout(() => scrollToBottom(), 100);
                }
            }
        });
    });

    // Start observing the chat messages container
    if (chatMessages) {
        chatObserver.observe(chatMessages, {
            childList: true,
            subtree: true
        });
    }

    // Handle news region change
    document.getElementById('newsRegion').addEventListener('change', function() {
        // Update welcome message when region changes
        if (document.querySelector('.welcome-message')) {
            showWelcomeMessage();
        }
        // Save selection
        localStorage.setItem('newsRegion', this.value);
    });

    // Initialize news region dropdown
    const newsRegionSelect = document.getElementById('newsRegion');
    if (newsRegionSelect) {
        // Restore saved region or default to global
        const savedRegion = localStorage.getItem('newsRegion') || 'global';
        newsRegionSelect.value = savedRegion;
    }

    // Function to update the displayed number of remaining queries
    function updateQueriesRemaining(queriesRemaining) {
        const queriesRemainingElement = document.getElementById('queriesRemaining');
        if (queriesRemainingElement) {
            queriesRemainingElement.textContent = queriesRemaining;
        }
    }
});