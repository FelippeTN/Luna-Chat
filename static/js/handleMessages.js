document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('prompt-input');
    const chatForm = document.getElementById('chat-form');
    const messagesContainer = document.getElementById('messages-container');
    const conversationIdInput = document.getElementById('conversation_id');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const welcomePlaceholder = document.getElementById('messages-placeholder');

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    chatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const prompt = textarea.value.trim();
        if (!prompt) {
            return;
        }

        const userMessageHtml = `
            <div class="w-full max-w-3xl mb-4 text-right">
                <div class="bg-violet-600/70 text-white rounded-lg p-3 inline-block max-w-[80%] break-words">
                    ${prompt}
                </div>
            </div>
        `;
        
        if (welcomePlaceholder) {
            welcomePlaceholder.style.display = 'none';
            messagesContainer.innerHTML = '<div id="messages-list" class="flex flex-col items-center h-full overflow-y-auto"></div>';
        }

        const messagesList = document.getElementById('messages-list');
        messagesList.innerHTML += userMessageHtml;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        textarea.value = '';
        textarea.style.height = 'auto';

        const conversationId = conversationIdInput.value || null;
        const llmApiUrl = chatForm.dataset.llmApiUrl; 

        fetch(llmApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ 
                prompt: prompt, 
                conversation_id: conversationId 
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const llmMessageHtml = `
                <div class="w-full max-w-3xl mb-4 text-left">
                    <div class="bg-gray-700 rounded-lg p-3 inline-block max-w-[80%] break-words">
                        ${data.response}
                    </div>
                </div>
            `;
            messagesList.innerHTML += llmMessageHtml;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            if (!conversationId) {
                conversationIdInput.value = data.conversation_id;
                window.history.pushState({}, '', `?conversation_id=${data.conversation_id}`);
                location.reload(); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const errorMessageHtml = `
                <div class="w-full max-w-3xl mb-4 text-left">
                    <div class="bg-red-500 rounded-lg p-3 inline-block max-w-[80%] break-words">
                        Ocorreu um erro ao processar sua solicitação.
                    </div>
                </div>
            `;
            messagesList.innerHTML += errorMessageHtml;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    });
});