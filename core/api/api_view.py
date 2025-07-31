from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import httpx, json, os
from dotenv import load_dotenv

load_dotenv()
URL_LLAMA = os.getenv("URL_LLAMA")
LLAMA_V1_COMPLETIONS = f"{URL_LLAMA}/v1/completions"


class LlmResponseView(APIView):
    permission_classes = [IsAuthenticated]

    async def _stream_llama_response(self, payload):
        headers = {'Content-Type': 'application/json'}
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", LLAMA_V1_COMPLETIONS, json=payload, headers=headers) as response:
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            json_str = line[6:]

                            if json_str == "[DONE]":
                                break

                            try:
                                data = json.loads(json_str)
                                delta = data.get('choices', [{}])[0].get('delta', {})
                                content_chunk = delta.get('content')

                                if content_chunk:
                                    yield content_chunk
                            except (json.JSONDecodeError, IndexError, KeyError):
                                continue

        except httpx.RequestError as e:
            yield f"Error connecting to AI service: {e}"
        except httpx.HTTPStatusError as e:
            yield f"AI service returned an error: {e.response.status_code}"

    async def post(self, request):
        user_message = request.data.get("message")

        use_stream = request.query_params.get("stream", "false").lower() == "true"
        
        if not user_message:
            return Response(
                {"error": "O campo 'message' não pode ser vazio."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "Você é um assistente de IA chamada Luna, desenvolvida por Felippe Toscano Nalim. Você deve responder de forma clara e objetiva, sempre buscando a melhor resposta possível para o usuário."
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "temperature": 0.7,
            "stream": use_stream
        }
        if use_stream:
            return StreamingHttpResponse(
                self._stream_llama_response(payload),
                status=status.HTTP_200_OK,
                content_type='text/plain'
            )
        else:
            headers = {'Content-Type': 'application/json'}
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(LLAMA_V1_COMPLETIONS, json=payload, headers=headers)
                    response.raise_for_status()
                
                response_data = response.json()
                ai_message_content = response_data.get('choices', [{}])[0].get('message', {}).get('content', '')
                return Response({"message": ai_message_content}, status=status.HTTP_200_OK)

            except Exception as e:
                return Response(
                    {"error": f"Erro ao se comunicar com o serviço de IA: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

