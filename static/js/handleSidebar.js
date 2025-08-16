const toggleButton = document.getElementById('toggle-sidebar-button');
const sidebar = document.getElementById('sidebar');
const conversationsContainer = document.getElementById('conversations-container');
const newChatButton = document.querySelector('.new-chat-button');

toggleButton.addEventListener('click', () => {
    const isSidebarCollapsed = sidebar.classList.toggle('-translate-x-full');

    if (isSidebarCollapsed) {
        sidebar.classList.add('w-16');
        sidebar.classList.remove('w-64');
        conversationsContainer.classList.add('hidden');
        newChatButton.classList.add('hidden'); 
    } else {
        sidebar.classList.add('w-64');
        sidebar.classList.remove('w-16');
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