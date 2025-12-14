const toggleButton = document.getElementById('toggle-sidebar-button');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const conversationsContainer = document.getElementById('conversations-container');
const newChatButton = document.querySelector('.new-chat-button');
const sidebarButtons = document.getElementById('sidebar-buttons');

toggleButton.addEventListener('click', () => {
    const isSidebarCollapsed = sidebar.classList.toggle('w-64');
    sidebar.classList.toggle('w-16');
    mainContent.classList.toggle('ps-64');
    mainContent.classList.toggle('ps-16');

    if (!isSidebarCollapsed) {
        conversationsContainer.classList.add('hidden');
        newChatButton.classList.add('hidden');
    } else {
        conversationsContainer.classList.remove('hidden');
        newChatButton.classList.remove('hidden');
    }
});

document.querySelectorAll('.delete-chat-button').forEach(button => {
    button.addEventListener('click', () => {
        const conversationId = button.dataset.conversationId;
        const csrfToken = button.dataset.csrfToken;

        fetch(`/api/delete-chat/${conversationId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            }
        })
        .then(response => {
            if (response.status === 204) {
                window.location.reload();
            } else {
                console.error('Falha ao deletar o chat.');
            }
        });
    });
});