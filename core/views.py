from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.decorators import login_required


def welcome_page(request):
    return render(request, 'welcome.html')


def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            return render(request, 'register_views/register.html', {'error': 'Passwords do not match.'})

        if User.objects.filter(email=email).exists():
            return render(request, 'register_views/register.html', {'error': 'Email already exists.'})

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        login(request, user)

        return redirect('chat_view')

    return render(request, 'register_views/register.html')


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('chat_view')
        else:
            messages.error(request, 'Email ou senha inválidos.')
            return redirect('login_view')
    return render(request, 'register_views/login.html')


@login_required
def chat_view(request):
    return render(request, 'chat_views/chat.html')
