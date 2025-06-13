document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');

    let currentSessionId = localStorage.getItem('currentSessionId') || '';

    // Create a new chat session if none exists
    if (!currentSessionId) {
        createNewChat();
    } else {
        // Load existing chat session
        loadChatSession(currentSessionId);
    }

    // Load chat history on page load
    loadChatHistory();

    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }

    // Handle Enter key
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
            }
        });
    }

    // New Chat button functionality
    if (newChatBtn && chatMessages) {
        newChatBtn.addEventListener('click', function() {
            createNewChat();
        });
    }

    function createNewChat() {
        fetch('/chat/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'  // Important for session cookies
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create new chat');
            }
            return response.json();
        })
        .then(data => {
            currentSessionId = data.session_id;
            localStorage.setItem('currentSessionId', currentSessionId);
            
            // Clear chat messages and show welcome message
            chatMessages.innerHTML = `
                <div class="message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">News Agent</span>
                            <span class="message-time">Just now</span>
                        </div>
                        <div class="message-text">
                            <p>Hello! I'm your AI news assistant. I can help you:</p>
                            <ul>
                                <li>Search for the latest news on any topic</li>
                                <li>Summarize news articles</li>
                                <li>Answer questions about current events</li>
                                <li>Provide context and analysis</li>
                            </ul>
                            <p>What would you like to know about today?</p>
                        </div>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error creating new chat:', error);
            addMessageToChat('error', 'Failed to create new chat. Please try again.');
        });
    }

    function loadChatHistory() {
        fetch('/chat/history', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'  // Important for session cookies
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chat history');
            }
            return response.json();
        })
        .then(data => {
            if (data.history && data.history.length > 0) {
                // Display chat history in sidebar
                chatHistory.innerHTML = data.history.map(chat => {
                    const firstMessage = chat.messages[0]?.content || 'New Chat';
                    const date = new Date(chat.created_at).toLocaleDateString();
                    const isActive = chat.session_id === currentSessionId;
                    return `
                        <div class="chat-history-item ${isActive ? 'active' : ''}" data-session-id="${chat.session_id}">
                            <div class="chat-history-preview">${firstMessage.substring(0, 50)}${firstMessage.length > 50 ? '...' : ''}</div>
                            <div class="chat-history-date">${date}</div>
                        </div>
                    `;
                }).join('');

                // Add click handlers for chat history items
                document.querySelectorAll('.chat-history-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const sessionId = this.dataset.sessionId;
                        loadChatSession(sessionId);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error loading chat history:', error);
            addMessageToChat('error', 'Failed to load chat history. Please refresh the page.');
        });
    }

    function loadChatSession(sessionId) {
        currentSessionId = sessionId;
        localStorage.setItem('currentSessionId', sessionId);
        
        // Clear current messages
        chatMessages.innerHTML = '';
        
        // Load messages for this session
        fetch('/chat/history', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'  // Important for session cookies
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chat session');
            }
            return response.json();
        })
        .then(data => {
            const chat = data.history.find(c => c.session_id === sessionId);
            if (chat) {
                chat.messages.forEach(message => {
                    addMessageToChat(message.role, message.content);
                });
            }
            // Update active state in sidebar
            document.querySelectorAll('.chat-history-item').forEach(item => {
                item.classList.toggle('active', item.dataset.sessionId === sessionId);
            });
        })
        .catch(error => {
            console.error('Error loading chat session:', error);
            addMessageToChat('error', 'Failed to load chat session. Please try again.');
        });
    }

    function handleChatSubmit(event) {
        event.preventDefault();

        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const message = messageInput.value.trim();

        if (!message) return;

        // Disable input and button while processing
        messageInput.disabled = true;
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // Add user message to chat
        addMessageToChat('user', message);

        // Clear input
        messageInput.value = '';

        // Send message to server
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',  // Important for session cookies
            body: JSON.stringify({ 
                message: message,
                session_id: currentSessionId
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.response) {
                addMessageToChat('assistant', data.response);
                // Reload chat history to show updated list
                loadChatHistory();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addMessageToChat('error', error.message || 'An error occurred while processing your message.');
            if (error.message.includes('not authenticated')) {
                // Redirect to login if session expired
                window.location.href = '/login';
            }
        })
        .finally(() => {
            // Re-enable input and button
            messageInput.disabled = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            messageInput.focus();
        });
    }

    function addMessageToChat(role, content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const timestamp = new Date().toLocaleTimeString();
        
        if (role === 'user') {
            messageContent.innerHTML = `
                <div class="message-header">
                    <i class="fas fa-user"></i>
                    <span>You</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${content}</div>
            `;
        } else if (role === 'assistant') {
            messageContent.innerHTML = `
                <div class="message-header">
                    <i class="fas fa-robot"></i>
                    <span>News Agent</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${content}</div>
            `;
        } else if (role === 'error') {
            messageContent.innerHTML = `
                <div class="message-header error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Error</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text error">${content}</div>
            `;
        }

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}); 