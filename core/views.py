from django.shortcuts import render, redirect
from django.urls import reverse

# Create your views here.
def welcome_page(request):

    return render(request, 'welcome.html')