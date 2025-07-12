from django.urls import path
from .views import *
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Luna-Chat-API",
        default_version='v1',
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.IsAuthenticated,),
)

urlpatterns = [
    path('', welcome_page, name='welcome_page'),
    path('login/', login_view, name='login_view'),
    path('register/', register_view, name='register_view'),
    path('chat/', chat_view, name='chat_view'),
]