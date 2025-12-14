document.addEventListener('DOMContentLoaded', () => {
    const fileInputButton = document.getElementById('file-input-button');
    const fileInput = document.getElementById('file-input');
    const fileDisplay = document.getElementById('file-display');
    const fileNameSpan = document.getElementById('file-name');
    const removeFileButton = document.getElementById('remove-file-button');
    const chatForm = document.getElementById('chat-form');
    const promptInput = document.getElementById('prompt-input');

    let uploadedFile = null;
    let extractedText = null;

    fileInputButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            uploadedFile = files[0];
            fileNameSpan.textContent = uploadedFile.name;
            fileDisplay.classList.remove('hidden');
            console.log('Arquivo selecionado:', uploadedFile.name);

            // Tentar extrair texto do arquivo no cliente
            const result = await fileTextExtractor.extractText(uploadedFile);
            if (result.success && !result.isServerProcessed) {
                extractedText = result.text;
                console.log('Texto extraído no cliente:', extractedText.substring(0, 100) + '...');
            } else if (result.isServerProcessed) {
                extractedText = null;
                console.log('Arquivo será processado no servidor');
            } else {
                console.warn('Erro na extração:', result.message);
                extractedText = null;
            }
        }
    });

    removeFileButton.addEventListener('click', () => {
        uploadedFile = null;
        extractedText = null;
        fileInput.value = null;
        fileDisplay.classList.add('hidden');
        console.log('Arquivo removido.');
    });

    // Ao enviar o formulário, dispara o evento para handleMessages.js capturar
    chatForm.addEventListener('submit', () => {
        // Apenas deixar handleMessages.js lidar com o envio
    });

    // Expor dados globalmente para handleMessages.js
    window.fileUploadData = {
        getUploadedFile() {
            return uploadedFile;
        },
        getExtractedText() {
            return extractedText;
        },
        clearData() {
            uploadedFile = null;
            extractedText = null;
            fileInput.value = null;
            fileDisplay.classList.add('hidden');
        }
    };
});
