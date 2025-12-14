class FileUploadManager {
    constructor() {
        this.uploadedFile = null;
        this.extractedText = null;
        this.fileInputButton = document.getElementById('file-input-button');
        this.fileInput = document.getElementById('file-input');
        this.fileDisplay = document.getElementById('file-display');
        this.fileNameSpan = document.getElementById('file-name');
        this.removeFileButton = document.getElementById('remove-file-button');
        this.messagesContainer = document.getElementById('messages-container');
    }

    init() {
        this.fileInputButton.addEventListener('click', (event) => this.handleFileButtonClick(event));
        this.fileInput.addEventListener('change', (event) => this.handleFileSelect(event));
        this.removeFileButton.addEventListener('click', (event) => this.removeFile(event));
        this.exposeGlobalAPI();
    }

    handleFileButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.fileInput.click();
    }

    async handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        this.uploadedFile = files[0];
        this.fileNameSpan.textContent = this.uploadedFile.name;
        this.fileDisplay.classList.remove('hidden');
        console.log('Arquivo selecionado:', this.uploadedFile.name);

        const result = await fileTextExtractor.extractText(this.uploadedFile);
        
        if (result.success && !result.isServerProcessed) {
            this.extractedText = result.text;
            console.log('Texto extraído no cliente:', this.extractedText.substring(0, 100) + '...');
        } else if (result.isServerProcessed) {
            this.extractedText = null;
            console.log('Arquivo será processado no servidor');
        } else {
            console.warn('Erro na extração:', result.message);
            this.extractedText = null;
        }
    }

    removeFile(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.uploadedFile = null;
        this.extractedText = null;
        this.fileInput.value = null;
        this.fileDisplay.classList.add('hidden');
        console.log('Arquivo removido.');
    }

    getUploadedFile() {
        return this.uploadedFile;
    }

    getExtractedText() {
        return this.extractedText;
    }

    clearData() {
        this.removeFile();
    }

    displayFileInChat() {
        if (!this.uploadedFile) return;
        
        const messagesList = document.getElementById('messages-list');
        if (!messagesList) return;

        const fileMessageDiv = document.createElement('div');
        fileMessageDiv.className = 'w-full max-w-3xl mb-4 text-right';
        fileMessageDiv.innerHTML = `
            <div class="bg-neutral-700 text-neutral-300 rounded-lg p-3 inline-block max-w-[80%] break-words text-sm">
                📎 <span class="font-semibold">${this.uploadedFile.name}</span>
                <br>
                <span class="text-xs text-neutral-400">${(this.uploadedFile.size / 1024).toFixed(2)} KB</span>
            </div>
        `;
        messagesList.appendChild(fileMessageDiv);
    }

    exposeGlobalAPI() {
        window.fileUploadManager = this;
        window.fileUploadData = {
            getUploadedFile: () => this.getUploadedFile(),
            getExtractedText: () => this.getExtractedText(),
            clearData: () => this.clearData(),
            displayFileInChat: () => this.displayFileInChat()
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileUploadManager = new FileUploadManager();
    fileUploadManager.init();
});
