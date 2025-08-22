from django.urls import path
from .views import *


urlpatterns = [
    path('', welcome_page, name='welcome_page'),
    path('login/', login_view, name='login_view'),
    path('register/', register_view, name='register_view'),
    path('logout/', logout_view, name='logout_view'),
    path('chat/', chat_view, name='chat_view'),
]