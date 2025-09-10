document.addEventListener('DOMContentLoaded', () => {
        const fileInputButton = document.getElementById('file-input-button');
        const fileInput = document.getElementById('file-input');
        const fileDisplay = document.getElementById('file-display');
        const fileNameSpan = document.getElementById('file-name');
        const removeFileButton = document.getElementById('remove-file-button');
        const chatForm = document.getElementById('chat-form');
        const promptInput = document.getElementById('prompt-input');

        let uploadedFile = null;

        fileInputButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                uploadedFile = files[0];
                fileNameSpan.textContent = uploadedFile.name;
                fileDisplay.classList.remove('hidden');
                console.log('Arquivo selecionado:', uploadedFile.name);
            }
        });

        removeFileButton.addEventListener('click', () => {
            uploadedFile = null;
            fileInput.value = null;
            fileDisplay.classList.add('hidden');
            console.log('Arquivo removido.');
        });

        chatForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const prompt = promptInput.value.trim();
            if (!prompt && !uploadedFile) {
                return;
            }

            const formData = new FormData();
            formData.append('prompt', prompt);

            if (uploadedFile) {
                formData.append('file', uploadedFile);
            }

            console.log('Enviando dados do formulário:', formData);

            // Simulação de envio para a API, substitua pela sua lógica real
            // const response = await fetch(chatForm.dataset.llmApiUrl, {
            //     method: 'POST',
            //     body: formData,
            //     // Seus cabeçalhos de autenticação, CSRF, etc.
            // });

            // const result = await response.json();
            // console.log('Resposta da API:', result);

            // Limpar o input e o arquivo após o envio
            promptInput.value = '';
            removeFileButton.click();
        });
    });