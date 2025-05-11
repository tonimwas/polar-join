"""
URL configuration for polarjoin project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve
from django.conf import settings
from pjapp import views
from pjapp.views import FrontendAppView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/calculate/', views.CalculateView.as_view(), name='calculate'),
    
    # Serve static files directly
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'frontend' / 'dist' / 'assets'}),
    re_path(r'^(?P<path>.*\.(svg|js|css|png|jpg|jpeg|gif|ico))$', serve, {'document_root': settings.BASE_DIR / 'frontend' / 'dist'}),
    
    # Catch-all for React frontend
    path('', FrontendAppView.as_view()),
]
