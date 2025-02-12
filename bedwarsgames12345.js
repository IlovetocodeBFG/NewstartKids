marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {}
                }
                return code;
            },
            breaks: true,
            gfm: true
        });

        const renderer = new marked.Renderer();
        const originalParagraph = renderer.paragraph.bind(renderer);

        renderer.paragraph = (text) => {
            const mathRegex = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;
            let result = text;
            let matches;
            
            while ((matches = mathRegex.exec(text)) !== null) {
                const isBlock = matches[1] !== undefined;
                const math = isBlock ? matches[1] : matches[2];
                try {
                    const rendered = katex.renderToString(math, {
                        displayMode: isBlock,
                        throwOnError: false
                    });
                    result = result.replace(matches[0], rendered);
                } catch (e) {
                    console.error('KaTeX error:', e);
                }
            }
            
            return originalParagraph(result);
        };

        marked.use({ renderer });

        class BigFishGamingAI {
            constructor() {
                this.chats = JSON.parse(localStorage.getItem('bigfishgamingai_chats') || '[]');
                this.activeChat = this.chats.length > 0 ? this.chats[0].id : null;
                this.API_CONFIG = {
                    baseURL: "https://api.groq.com/openai/v1/chat/completions",
                    model: "deepseek-r1-distill-llama-70b",
                    defaultParams: {
                        temperature: 0.9,
                        max_tokens: 1024,
                        top_p: 1,
                        frequency_penalty: 0,
                        presence_penalty: 0,
                        stream: false
                    }
                };
                
                this.initElements();
                this.initEventListeners();
                
                if (this.chats.length === 0) {
                    this.createNewChat();
                } else {
                    this.renderChats();
                    this.renderMessages();
                }
            }

            initElements() {
                this.elements = {
                    chatsList: document.querySelector('.chats-list'),
                    messageContainer: document.querySelector('.message-container'),
                    messageInput: document.querySelector('.message-input'),
                    sendButton: document.querySelector('.send-btn'),
                    newChatBtn: document.querySelector('.new-chat-btn'),
                    exportBtn: document.querySelector('.export-btn'),
                    menuToggle: document.querySelector('.menu-toggle'),
                    sidebar: document.querySelector('.sidebar')
                };

                this.elements.messageInput.addEventListener('input', () => {
                    this.elements.messageInput.style.height = 'auto';
                    this.elements.messageInput.style.height = 
                        Math.min(this.elements.messageInput.scrollHeight, 200) + 'px';
                });
            }

            initEventListeners() {
                this.elements.sendButton.addEventListener('click', () => this.sendMessage());
                this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
                this.elements.exportBtn.addEventListener('click', () => this.exportCurrentChat());
                this.elements.messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
                this.elements.menuToggle.addEventListener('click', () => {
                    this.elements.sidebar.classList.toggle('active');
                });
            }

            createNewChat() {
                const newChat = {
                    id: Date.now(),
                    title: 'New Chat',
                    messages: []
                };
                this.chats.unshift(newChat);
                this.activeChat = newChat.id;
                               this.saveChats();
                this.renderChats();
                this.renderMessages();
                this.elements.messageInput.focus();
            }

            deleteChat(chatId) {
                if (this.chats.length <= 1) return;
                
                const index = this.chats.findIndex(chat => chat.id === chatId);
                if (index !== -1) {
                    this.chats.splice(index, 1);
                    if (this.activeChat === chatId) {
                        this.activeChat = this.chats[0].id;
                    }
                    this.saveChats();
                    this.renderChats();
                    this.renderMessages();
                }
            }

            saveChats() {
                localStorage.setItem('bigfishgamingai_chats', JSON.stringify(this.chats));
            }

            exportCurrentChat() {
                const currentChat = this.chats.find(chat => chat.id === this.activeChat);
                if (!currentChat) return;

                const exportData = {
                    ...currentChat,
                    exportDate: new Date().toISOString(),
                    version: 'BigFishGaming AI v1.21'
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `bigfishgamingai_chat_${currentChat.id}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            renderMathInContent(content) {
                const mathRegex = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;
                return content.replace(mathRegex, (match, block, inline) => {
                    try {
                        const tex = block || inline;
                        const isDisplayMode = !!block;
                        return katex.renderToString(tex, {
                            displayMode: isDisplayMode,
                            throwOnError: false
                        });
                    } catch (e) {
                        console.error('KaTeX error:', e);
                        return match;
                    }
                });
            }

            async sendMessage() {
                const content = this.elements.messageInput.value.trim();
                if (!content) return;

                const currentChat = this.chats.find(chat => chat.id === this.activeChat);
                if (!currentChat) return;

                currentChat.messages.push({
                    role: 'user',
                    content: content,
                    timestamp: new Date().toISOString()
                });

                if (currentChat.messages.length === 1) {
                    currentChat.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
                }

                this.elements.messageInput.value = '';
                this.elements.messageInput.style.height = 'auto';

                this.renderMessages();
                this.renderChats();
                this.saveChats();

                try {
                    const response = await fetch(this.API_CONFIG.baseURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        body: JSON.stringify({
                            model: this.API_CONFIG.model,
                            messages: [
                                {
                                    role: "system",
                                    content: "You are BigFishGaming AI 1.21, a helpful and knowledgeable AI assistant. You are direct, informative, and friendly in your responses."
                                },
                                ...currentChat.messages.map(msg => ({
                                    role: msg.role,
                                    content: msg.content
                                }))
                            ],
                            ...this.API_CONFIG.defaultParams
                        })
                    });

                    if (!response.ok) {
                        throw new Error('API request failed');
                    }

                    const data = await response.json();
                    
                    currentChat.messages.push({
                        role: 'assistant',
                        content: data.choices[0].message.content,
                        timestamp: new Date().toISOString()
                    });

                    this.saveChats();
                    this.renderMessages();
                } catch (error) {
                    console.error('Error:', error);
                    currentChat.messages.push({
                        role: 'assistant',
                        content: 'I apologize, but I encountered an error. Please try again.',
                        timestamp: new Date().toISOString()
                    });
                    this.renderMessages();
                }
            }

            renderChats() {
                this.elements.chatsList.innerHTML = '';
                
                this.chats.forEach(chat => {
                    const chatElement = document.createElement('div');
                    chatElement.className = `chat-item ${chat.id === this.activeChat ? 'active' : ''}`;
                    
                    chatElement.innerHTML = `
                        <i class="fas fa-message"></i>
                        <span>${chat.title}</span>
                        ${this.chats.length > 1 ? `
                            <button class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    `;

                    chatElement.addEventListener('click', (e) => {
                        if (!e.target.closest('.delete-btn')) {
                            this.activeChat = chat.id;
                            this.renderChats();
                            this.renderMessages();
                            this.elements.sidebar.classList.remove('active');
                        }
                    });

                    const deleteBtn = chatElement.querySelector('.delete-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.deleteChat(chat.id);
                        });
                    }

                    this.elements.chatsList.appendChild(chatElement);
                });
            }

            renderMessages() {
                this.elements.messageContainer.innerHTML = '';
                const currentChat = this.chats.find(chat => chat.id === this.activeChat);
                
                if (!currentChat || currentChat.messages.length === 0) {
                    this.elements.messageContainer.innerHTML = `
                        <div class="welcome-message">
                            Welcome to BigFishGaming AI! How can I assist you today?
                        </div>
                    `;
                    return;
                }

                currentChat.messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${message.role === 'user' ? 'user' : 'ai'}`;
                    messageElement.innerHTML = this.renderMathInContent(message.content);
                    this.elements.messageContainer.appendChild(messageElement);
                });

                this.elements.messageContainer.scrollTop = this.elements.messageContainer.scrollHeight;
            }
        }

        const app = new BigFishGamingAI();
