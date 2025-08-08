from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from core.models import UserConversation


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


def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return redirect('welcome_page')


@login_required
def chat_view(request):
    conversation_id = request.GET.get('conversation_id')
    current_conversation = None
    messages = []
    
    if conversation_id:
        try:
            current_conversation = UserConversation.objects.get(conversation_id=conversation_id, user=request.user)
            messages = current_conversation.messages
        except UserConversation.DoesNotExist:
            pass

    chats = UserConversation.objects.filter(user=request.user).order_by('-created_at')

    context = {
        'chats': chats,
        'current_conversation': current_conversation,
        'messages': messages
    }
    return render(request, 'chat_views/chat.html', context)