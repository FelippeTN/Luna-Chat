from django.urls import path
from .views import *
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .api.api_view import *

schema_view = get_schema_view(
   openapi.Info(
      title="Sua API",
      default_version='v1',
      description="Descrição da sua API",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@suaapi.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('api/llm-response/', LlmResponseView.as_view(), name='llm_response'),
    path("api/llm-response-stream/", LlmStreamResponseView.as_view(), name="llm_stream_response"),
    path('api/get-chats/', GetChats.as_view(), name='get_chats'),
    path('api/delete-chat/<uuid:chat_id>/', DeleteChat.as_view(), name='delete_chat'),

    path('swagger/', schema_view.with_ui('swagger',cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc',cache_timeout=0), name='schema-redoc'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]