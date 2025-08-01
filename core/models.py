from django.db import models

class UserConversation(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    conversation_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    messages = models.JSONField(default=list)
    
    def __str__(self):
        return f"{self.user.username} - {self.conversation_id}"
    
    def add_message(self, message):
        self.messages.append(message)
        self.save()