from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from dotenv import load_dotenv
import asyncio, os
from groq import AsyncGroq

load_dotenv()
GROQ_KEY = os.getenv("GROQ_KEY")


class LlmResponseView(APIView):
    permission_classes = [IsAuthenticated]
    
    async def _stream_groq_response(self, user_message):
        client = AsyncGroq(api_key=GROQ_KEY)
        
        chat_completion = await client.chat.completions.create(
            messages =[
                {
                    "role": "system",
                    "content": "Você é um assistente de IA chamada Luna, desenvolvida por Felippe Toscano Nalim. Você deve responder de forma clara e objetiva, sempre buscando a melhor resposta possível para o usuário."
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            top_p=1,
            stop=None,
            stream=True
            )
            
        for chunk in chat_completion:
            print(chunk.choices[0].delta.content, end='')
            yield chunk.choices[0].delta.content
        

    async def post(self, request):
        user_message = request.data.get("message")
        
        if not user_message:
            return Response(
                {"error": "O campo 'message' não pode ser vazio."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if user_message:
            return StreamingHttpResponse(
                self._stream_groq_response(user_message),
                status=status.HTTP_200_OK,
                content_type='text/plain'
            )
        

