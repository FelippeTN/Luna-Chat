/**
 * Extrai texto de diferentes tipos de arquivo no cliente
 */

class FileTextExtractor {
    constructor() {
        this.supportedFormats = ['pdf', 'docx', 'pptx', 'txt'];
    }

    /**
     * Método principal para extrair texto
     */
    async extractText(file) {
        const extension = this.getFileExtension(file.name);

        if (!this.supportedFormats.includes(extension)) {
            return {
                success: false,
                message: `Formato não suportado: ${extension}. Suporte: PDF, DOCX, PPTX, TXT`
            };
        }

        try {
            let text = '';

            switch (extension) {
                case 'txt':
                    text = await this.extractFromTxt(file);
                    break;
                case 'pdf':
                    text = await this.extractFromPdf(file);
                    break;
                case 'docx':
                    // Para DOCX, será processado no backend
                    return {
                        success: true,
                        message: 'Arquivo DOCX será processado no servidor',
                        isServerProcessed: true
                    };
                case 'pptx':
                    // Para PPTX, será processado no backend
                    return {
                        success: true,
                        message: 'Arquivo PPTX será processado no servidor',
                        isServerProcessed: true
                    };
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

    /**
     * Extrai texto de arquivo TXT
     */
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

    /**
     * Extrai texto de arquivo PDF usando PDF.js
     */
    async extractFromPdf(file) {
        // Verificar se PDF.js está disponível
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

    /**
     * Obtém a extensão do arquivo
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
}

// Instância global
const fileTextExtractor = new FileTextExtractor();
