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