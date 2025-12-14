class ChatMessageHandler {
    constructor() {
        this.textarea = document.getElementById('prompt-input');
        this.chatForm = document.getElementById('chat-form');
        this.messagesContainer = document.getElementById('messages-container');
        this.conversationIdInput = document.getElementById('conversation_id');
        this.csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        this.welcomePlaceholder = document.getElementById('messages-placeholder');
        this.messagesList = document.getElementById('messages-list');
    }

    init() {
        this.textarea.addEventListener('input', () => this.handleTextareaInput());
        this.textarea.addEventListener('keydown', (event) => this.handleTextareaKeydown(event));
        this.chatForm.addEventListener('submit', (event) => this.handleFormSubmit(event));
    }

    handleTextareaInput() {
        this.textarea.style.height = 'auto';
        this.textarea.style.height = (this.textarea.scrollHeight) + 'px';
    }

    handleTextareaKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.chatForm.dispatchEvent(new Event('submit'));
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();

        const prompt = this.textarea.value.trim();
        if (!prompt) return;

        // Salvar primeira mensagem para usar na sidebar (se for nova conversa)
        if (!this.conversationIdInput.value) {
            this.textarea.dataset.firstMessage = prompt;
        }

        this.displayUserMessage(prompt);
        this.displayUserFile();

        this.textarea.value = '';
        this.textarea.style.height = 'auto';

        const conversationId = this.conversationIdInput.value || null;
        const llmApiUrl = this.chatForm.dataset.llmApiUrl;

        await this.sendMessageToLLM(prompt, conversationId, llmApiUrl);
    }

    displayUserMessage(prompt) {
        if (this.welcomePlaceholder) {
            this.welcomePlaceholder.style.display = 'none';
        }

        if (!this.messagesList) {
            this.messagesList = document.createElement('div');
            this.messagesList.id = 'messages-list';
            this.messagesList.className = 'flex flex-col items-center h-full overflow-y-auto';
            this.messagesContainer.appendChild(this.messagesList);
        }

        const userMessageHtml = `
            <div class="w-full max-w-3xl mb-4 text-right">
                <div class="bg-neutral-600/70 text-white rounded-lg p-3 inline-block max-w-[80%] break-words">
                    ${prompt}
                </div>
            </div>
        `;

        this.messagesList.innerHTML += userMessageHtml;
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    displayUserFile() {
        if (window.fileUploadData?.displayFileInChat) {
            window.fileUploadData.displayFileInChat();
        }
    }

    async sendMessageToLLM(prompt, conversationId, llmApiUrl) {
        const uniqueResponseId = `streaming-response-${Date.now()}`;
        this.createLLMResponseDiv(uniqueResponseId);

        const formData = this.prepareFormData(prompt, conversationId);
        
        // Guardar se é nova conversa ANTES de atualizar o ID
        const isNewConversation = !conversationId;
        const firstMessage = this.textarea.dataset.firstMessage || prompt;

        try {
            const response = await fetch(llmApiUrl, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.csrftoken
                },
                body: formData
            });

            if (!response.ok) throw new Error("Erro na requisição");

            const newConvId = response.headers.get("Conversation-Id");
            if (!conversationId) {
                this.conversationIdInput.value = newConvId;
            }

            await this.streamLLMResponse(response, uniqueResponseId, newConvId, isNewConversation, firstMessage);
        } catch (error) {
            console.error("Erro:", error);
            document.getElementById(uniqueResponseId).textContent = "Erro ao gerar resposta.";
            this.clearUploadedFile();
        }
    }

    createLLMResponseDiv(uniqueResponseId) {
        const llmMessageDiv = document.createElement("div");
        llmMessageDiv.className = "w-full max-w-3xl mb-4 text-left";
        llmMessageDiv.innerHTML = `
            <div class="rounded-lg p-3 inline-block max-w-[80%] break-words" id="${uniqueResponseId}"></div>
        `;
        this.messagesList.appendChild(llmMessageDiv);
    }

    prepareFormData(prompt, conversationId) {
        const formData = new FormData();
        formData.append('prompt', prompt);
        if (conversationId) {
            formData.append('conversation_id', conversationId);
        }

        const uploadedFile = window.fileUploadData?.getUploadedFile();
        if (uploadedFile) {
            formData.append('file', uploadedFile);
        }

        return formData;
    }

    async streamLLMResponse(response, uniqueResponseId, newConvId, isNewConversation, firstMessage) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        const readChunk = () => {
            reader.read().then(({ done, value }) => {
                if (done) {
                    this.clearUploadedFile();
                    // Atualizar a URL sem recarregar a página
                    if (window.history.pushState) {
                        const newUrl = `${window.location.pathname}?conversation_id=${newConvId}`;
                        window.history.pushState({conversationId: newConvId}, '', newUrl);
                        this.conversationIdInput.value = newConvId;
                    }
                    // Adicionar novo chat na sidebar se for uma nova conversa
                    if (isNewConversation) {
                        this.addChatToSidebar(newConvId, firstMessage);
                    }
                    return;
                }
                buffer += decoder.decode(value, { stream: true });
                document.getElementById(uniqueResponseId).textContent = buffer;
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                readChunk();
            });
        };
        readChunk();
    }

    addChatToSidebar(conversationId, messageText) {
        const conversationsContainer = document.getElementById('conversations-container');
        if (!conversationsContainer) return;

        const truncatedText = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        
        const chatDiv = document.createElement('div');
        chatDiv.id = 'conversations';
        chatDiv.className = 'relative flex items-center group';
        chatDiv.innerHTML = `
            <a href="?conversation_id=${conversationId}" class="flex-grow flex items-center px-3 py-3 text-neutral-400 hover:bg-neutral-700/40 hover:text-white transition-colors duration-200 rounded-2xl group">
                <span class="truncate text-sm text-white">${truncatedText || 'Novo Chat'}</span>
            </a>
            <button type="button" class="delete-chat-button p-2 text-neutral-500 hover:text-red-500 transition-colors duration-200" data-conversation-id="${conversationId}" data-csrf-token="${this.csrftoken}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;

        // Inserir após o título "Chats"
        const chatsTitle = conversationsContainer.querySelector('.px-3.mb-2');
        if (chatsTitle && chatsTitle.nextSibling) {
            conversationsContainer.insertBefore(chatDiv, chatsTitle.nextSibling);
        } else {
            conversationsContainer.appendChild(chatDiv);
        }

        // Adicionar evento de delete ao novo botão
        const deleteBtn = chatDiv.querySelector('.delete-chat-button');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const convId = deleteBtn.dataset.conversationId;
                const csrfToken = deleteBtn.dataset.csrfToken;
                try {
                    const response = await fetch(`/api/delete-chat/${convId}/`, {
                        method: 'DELETE',
                        headers: { 'X-CSRFToken': csrfToken }
                    });
                    if (response.status === 204) {
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Erro ao deletar chat:', error);
                }
            });
        }
    }

    clearUploadedFile() {
        if (window.fileUploadData) {
            window.fileUploadData.clearData();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const chatMessageHandler = new ChatMessageHandler();
    chatMessageHandler.init();
});