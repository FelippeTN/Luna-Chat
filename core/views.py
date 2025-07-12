from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required

def welcome_page(request):
    return render(request, 'welcome.html')

def register_view(request):
    return render(request, 'register.html')

def login_view(request):
    return render(request, 'login.html')

def chat_view(request):
    return render(request, 'chat.html')