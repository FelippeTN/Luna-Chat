from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from dotenv import load_dotenv
import os
from groq import Groq
from drf_yasg.utils import swagger_auto_schema
from .serializers import UserRequestLLMSerializer

load_dotenv()
GROQ_KEY = os.getenv("GROQ_KEY")


class LlmResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def groq_response(self, prompt, max_tokens, temperature):
        client = Groq(api_key=GROQ_KEY)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de IA chamada Luna, desenvolvida por Felippe Toscano Nalim. Você deve responder de forma clara e objetiva, sempre buscando a melhor resposta possível para o usuário."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=1,
            stop=None,
            stream=False 
        )
            
        return chat_completion.choices[0].message.content

    @swagger_auto_schema(
        request_body=UserRequestLLMSerializer,
        responses={
            200: 'Resposta do LLM em texto plano.',
            400: 'Erro de requisição, por exemplo, campo "prompt" ausente.'
        },
        operation_summary="Envia um prompt para o LLM",
        operation_description="Este endpoint recebe um prompt e outros parâmetros para interagir com o modelo de linguagem grande (LLM) e retorna a resposta gerada."
    )
    def post(self, request):
        serializer = UserRequestLLMSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        prompt = validated_data.get("prompt")
        max_tokens = validated_data.get("max_tokens")
        temperature = validated_data.get("temperature")
        
        llm_response_content = self.groq_response(prompt, max_tokens, temperature)
        
        return Response(
            llm_response_content,
            status=status.HTTP_200_OK,
            content_type='text/plain'
        )