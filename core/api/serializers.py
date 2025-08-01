from rest_framework import serializers


class UserRequestLLMSerializer(serializers.Serializer):

    prompt = serializers.CharField(
        help_text="The prompt to send to the LLM."
    )
    max_tokens = serializers.IntegerField(
        default=100,
        help_text="Maximum number of tokens to generate in the response."
    )
    temperature = serializers.FloatField(
        default=0.7,
        help_text="Sampling temperature for the LLM response."
    )