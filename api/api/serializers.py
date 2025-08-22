from rest_framework import serializers
from ..models import UserConversation


class UserRequestLLMSerializer(serializers.Serializer):
    prompt = serializers.CharField()
    conversation_id = serializers.CharField(required=False, allow_null=True, allow_blank=True) 
    max_tokens = serializers.IntegerField(default=2048)
    temperature = serializers.FloatField(default=0.7)

class UserConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserConversation
        fields = ['conversation_id', 'created_at', 'messages']