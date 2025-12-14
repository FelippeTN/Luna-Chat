class SidebarToggle {
    constructor() {
        this.toggleButton = document.getElementById('toggle-sidebar-button');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('main-content');
        this.conversationsContainer = document.getElementById('conversations-container');
        this.newChatButton = document.querySelector('.new-chat-button');
    }

    init() {
        this.toggleButton.addEventListener('click', () => this.toggle());
    }

    toggle() {
        const isSidebarCollapsed = this.sidebar.classList.toggle('w-64');
        this.sidebar.classList.toggle('w-16');
        this.mainContent.classList.toggle('ps-64');
        this.mainContent.classList.toggle('ps-16');

        if (!isSidebarCollapsed) {
            this.conversationsContainer.classList.add('hidden');
            this.newChatButton.classList.add('hidden');
        } else {
            this.conversationsContainer.classList.remove('hidden');
            this.newChatButton.classList.remove('hidden');
        }
    }
}

class ChatDeleter {
    constructor() {
        this.csrfTokenAttribute = 'data-csrf-token';
        this.conversationIdAttribute = 'data-conversation-id';
    }

    init() {
        document.querySelectorAll('.delete-chat-button').forEach(button => {
            button.addEventListener('click', () => this.handleDelete(button));
        });
    }

    async handleDelete(button) {
        const conversationId = button.dataset.conversationId;
        const csrfToken = button.dataset.csrfToken;

        try {
            const response = await fetch(`/api/delete-chat/${conversationId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                }
            });

            if (response.status === 204) {
                window.location.reload();
            } else {
                console.error('Falha ao deletar o chat.');
            }
        } catch (error) {
            console.error('Erro ao deletar chat:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = new SidebarToggle();
    sidebarToggle.init();

    const chatDeleter = new ChatDeleter();
    chatDeleter.init();
});