from django.urls import path
from .views import *
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from core.api.api_view import Llm_ResponseView

schema_view = get_schema_view(
    openapi.Info(
        title="Luna-Chat-API",
        default_version='v1',
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', welcome_page, name='welcome_page'),
    path('login/', login_view, name='login_view'),
    path('register/', register_view, name='register_view'),
    path('chat/', chat_view, name='chat_view'),

    path('api/llm-response/', Llm_ResponseView.as_view(), name='llm_response'),

    path('swagger/', schema_view.with_ui('swagger',
         cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc',
         cache_timeout=0), name='schema-redoc'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]
