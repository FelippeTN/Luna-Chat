from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from dotenv import load_dotenv
import os, uuid
from groq import Groq
from django.http import StreamingHttpResponse
from drf_yasg.utils import swagger_auto_schema
from .models import UserConversation
from .serializers import UserRequestLLMSerializer
from .serializers import UserRequestLLMSerializer, UserConversationSerializer
from .text_extractor import extract_text_from_file

load_dotenv()
GROQ_KEY = os.getenv("GROQ_KEY")

class LlmStreamResponseView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=UserRequestLLMSerializer,
        responses={
            200: 'Resposta do LLM em formato de streaming.',
            400: 'Erro de requisição, por exemplo, campo "prompt" ausente.'
        },
        operation_summary="Envia um prompt para o LLM em modo de streaming",
        operation_description="Este endpoint recebe um prompt para interagir com o modelo de linguagem grande (LLM) e retorna a resposta em tempo real, em modo de streaming."
    )
    def post(self, request):
        serializer = UserRequestLLMSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data["prompt"]
        conversation_id = serializer.validated_data.get("conversation_id")
        max_tokens = serializer.validated_data.get("max_tokens", 2048)
        temperature = serializer.validated_data.get("temperature", 0.7)
        file_obj = serializer.validated_data.get("file")
        
        extracted_text = None
        file_name = None
        if file_obj:
            extracted_text = extract_text_from_file(file_obj)
            file_name = file_obj.name

        if conversation_id:
            conversation, _ = UserConversation.objects.get_or_create(
                user=request.user,
                conversation_id=conversation_id
            )
        else:
            conversation_id = str(uuid.uuid4())
            conversation = UserConversation.objects.create(
                user=request.user,
                conversation_id=conversation_id
            )

        user_message_content = prompt
        if file_name:
            user_message_content = f"{prompt}\n\n📎 Documento anexado: {file_name}"
        conversation.add_message(role="user", content=user_message_content)
        
        llm_prompt = prompt
        if extracted_text:
            llm_prompt = f"{prompt}\n\nTexto extraído do documento:\n{extracted_text}"

        client = Groq(api_key=GROQ_KEY)
        system_message = {
            "role": "system",
            "content": "Você é um assistente de IA chamada Luna. Desenvolvida por Felippe Toscano Nalim. Você deve responder de forma clara e objetiva, sempre buscando a melhor resposta possível para o usuário."
        }
        
        messages_for_llm = []
        for msg in conversation.messages:
            if msg == conversation.messages[-1] and msg["role"] == "user":
                messages_for_llm.append({"role": "user", "content": llm_prompt})
            else:
                messages_for_llm.append(msg)
        
        messages_to_send = [system_message] + messages_for_llm

        def stream_generator():
            full_response = ""
            try:
                for chunk in client.chat.completions.create(
                    messages=messages_to_send,
                    model="llama-3.3-70b-versatile",
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=True
                ):
                    delta = chunk.choices[0].delta.content or ""
                    if delta:
                        full_response += delta
                        yield delta
                        
            except Exception as e:
                yield f"Erro ao gerar a resposta: {str(e)}"
            finally:
                if full_response:
                    conversation.add_message(role="assistant", content=full_response)
                    conversation.save()

        response = StreamingHttpResponse(stream_generator(), content_type="text/plain; charset=utf-8")
        response["Conversation-Id"] = conversation_id
        return response

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
    
class DeleteChat(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={204: 'Chat deletado com sucesso.'},
        operation_summary="Deleta uma conversa específica",
        operation_description="Remove uma conversa específica do usuário autenticado com base no ID da conversa."
    )
    def delete(self, request, chat_id):
        try:
            chat = UserConversation.objects.get(user=request.user, conversation_id=chat_id)
            chat.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserConversation.DoesNotExist:
            return Response({"error": "Chat not found."}, status=status.HTTP_404_NOT_FOUND)