document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('prompt-input');
    const chatForm = document.getElementById('chat-form');
    const messagesContainer = document.getElementById('messages-container');
    const conversationIdInput = document.getElementById('conversation_id');
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const welcomePlaceholder = document.getElementById('messages-placeholder');
    let messagesList = document.getElementById('messages-list');

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    textarea.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const prompt = textarea.value.trim();
        if (!prompt) return;

        const userMessageHtml = `
            <div class="w-full max-w-3xl mb-4 text-right">
                <div class="bg-neutral-600/70 text-white rounded-lg p-3 inline-block max-w-[80%] break-words">
                    ${prompt}
                </div>
            </div>
        `;

        if (welcomePlaceholder) {
            welcomePlaceholder.style.display = 'none';
        }

        if (!messagesList) {
            messagesList = document.createElement('div');
            messagesList.id = 'messages-list';
            messagesList.className = 'flex flex-col items-center h-full overflow-y-auto';
            messagesContainer.appendChild(messagesList);
        }

        messagesList.innerHTML += userMessageHtml;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        textarea.value = '';
        textarea.style.height = 'auto';

        const conversationId = conversationIdInput.value || null;
        const llmApiUrl = chatForm.dataset.llmApiUrl;

        const uniqueResponseId = `streaming-response-${Date.now()}`;

        const llmMessageDiv = document.createElement("div");
        llmMessageDiv.className = "w-full max-w-3xl mb-4 text-left";
        llmMessageDiv.innerHTML = `
            <div class="rounded-lg p-3 inline-block max-w-[80%] break-words" id="${uniqueResponseId}"></div>
        `;
        messagesList.appendChild(llmMessageDiv);

        // Preparar o FormData com arquivo e texto extraído
        const formData = new FormData();
        formData.append('prompt', prompt);
        if (conversationId) {
            formData.append('conversation_id', conversationId);
        }

        // Adicionar arquivo se disponível
        const uploadedFile = window.fileUploadData?.getUploadedFile();
        const extractedText = window.fileUploadData?.getExtractedText();

        if (uploadedFile) {
            formData.append('file', uploadedFile);
        }

        fetch(llmApiUrl, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        }).then(response => {
            if (!response.ok) throw new Error("Erro na requisição");

            const newConvId = response.headers.get("Conversation-Id");
            if (!conversationId) {
                conversationIdInput.value = newConvId;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            function readChunk() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        // Limpar arquivo após o envio
                        if (window.fileUploadData) {
                            window.fileUploadData.clearData();
                        }
                        return;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    document.getElementById(uniqueResponseId).textContent = buffer;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    window.location.href = `?conversation_id=${newConvId}`;
                    readChunk();
                });
            }
            readChunk();
        }).catch(error => {
            console.error("Erro:", error);
            document.getElementById(uniqueResponseId).textContent = "Erro ao gerar resposta.";
            // Limpar arquivo após erro
            if (window.fileUploadData) {
                window.fileUploadData.clearData();
            }
        });
    });
});