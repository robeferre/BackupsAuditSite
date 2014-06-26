from django.shortcuts import render
from django.shortcuts import render_to_response
from django.template.context import RequestContext

def login(request):
    return render_to_response('login/login.html',  context_instance=RequestContext(request))

def home(request):
    return render_to_response('app/home.html',  context_instance=RequestContext(request))