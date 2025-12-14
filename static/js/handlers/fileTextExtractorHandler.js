class FileFormatValidator {
    constructor() {
        this.supportedFormats = ['pdf', 'docx', 'pptx', 'txt'];
        this.serverProcessedFormats = ['docx', 'pptx'];
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    isSupported(file) {
        const extension = this.getFileExtension(file.name);
        return this.supportedFormats.includes(extension);
    }

    isServerProcessed(file) {
        const extension = this.getFileExtension(file.name);
        return this.serverProcessedFormats.includes(extension);
    }

    getErrorMessage(extension) {
        return `Formato não suportado: ${extension}. Suporte: PDF, DOCX, PPTX, TXT`;
    }
}

class TextExtractor {
    constructor() {
        this.validator = new FileFormatValidator();
    }

    async extract(file) {
        if (!this.validator.isSupported(file)) {
            const extension = this.validator.getFileExtension(file.name);
            return {
                success: false,
                message: this.validator.getErrorMessage(extension)
            };
        }

        if (this.validator.isServerProcessed(file)) {
            return {
                success: true,
                message: `Arquivo ${this.validator.getFileExtension(file.name).toUpperCase()} será processado no servidor`,
                isServerProcessed: true
            };
        }

        try {
            const extension = this.validator.getFileExtension(file.name);
            let text = '';

            switch (extension) {
                case 'txt':
                    text = await this.extractFromTxt(file);
                    break;
                case 'pdf':
                    text = await this.extractFromPdf(file);
                    break;
                default:
                    return {
                        success: false,
                        message: `Formato não implementado: ${extension}`
                    };
            }

            return {
                success: true,
                text: text,
                isServerProcessed: false
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao extrair texto: ${error.message}`
            };
        }
    }

    async extractFromTxt(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    resolve(text || 'Arquivo vazio');
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsText(file, 'utf-8');
        });
    }

    async extractFromPdf(file) {
        if (typeof pdfjsLib === 'undefined') {
            return 'Biblioteca PDF.js não carregada. PDF será processado no servidor.';
        }

        return new Promise(async (resolve, reject) => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';
                for (let i = 0; i < pdf.numPages; i++) {
                    const page = await pdf.getPage(i + 1);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ');
                    fullText += pageText + '\n';
                }

                resolve(fullText || 'Nenhum texto encontrado no PDF');
            } catch (error) {
                reject(error);
            }
        });
    }
}

class FileTextExtractor {
    constructor() {
        this.extractor = new TextExtractor();
    }

    async extractText(file) {
        return this.extractor.extract(file);
    }
}

const fileTextExtractor = new FileTextExtractor();
