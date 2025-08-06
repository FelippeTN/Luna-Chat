from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from dotenv import load_dotenv
import os
import uuid
from groq import Groq
from drf_yasg.utils import swagger_auto_schema
from .serializers import UserRequestLLMSerializer
from ..models import UserConversation
from .serializers import UserRequestLLMSerializer, UserConversationSerializer

load_dotenv()
GROQ_KEY = os.getenv("GROQ_KEY")


class LlmResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def groq_response(self, message_history, max_tokens, temperature):
        client = Groq(api_key=GROQ_KEY)
        
        system_message = {
            "role": "system",
            "content": "Você é um assistente de IA chamada Luna, desenvolvida por Felippe Toscano Nalim. Você deve responder de forma clara e objetiva, sempre buscando a melhor resposta possível para o usuário."
        }

        messages_to_send = [system_message] + message_history

        chat_completion = client.chat.completions.create(
            messages=messages_to_send,
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
        conversation_id = validated_data.get("conversation_id")
        max_tokens = validated_data.get("max_tokens")
        temperature = validated_data.get("temperature")
        
        if conversation_id:
            conversation, created = UserConversation.objects.get_or_create(
                user=request.user,
                conversation_id=conversation_id
            )
        else:
            conversation_id = str(uuid.uuid4())
            conversation = UserConversation.objects.create(
                user=request.user,
                conversation_id=conversation_id
            )
        
        conversation.add_message(role="user", content=prompt)
        
        llm_response_content = self.groq_response(
            message_history=conversation.messages,
            max_tokens=max_tokens, 
            temperature=temperature
        )

        conversation.add_message(role="assistant", content=llm_response_content)
        
        conversation.save()

        response_data = {
            "response": llm_response_content,
            "conversation_id": conversation.conversation_id
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        

class GetChats(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: UserConversationSerializer(many=True)},
        operation_summary="Recupera todas as conversas do usuário",
        operation_description="Retorna uma lista de todas as conversas salvas para o usuário autenticado."
    )
    def get(self, request):
        chats = UserConversation.objects.filter(user=request.user).order_by('-created_at')

        serializer = UserConversationSerializer(chats, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)