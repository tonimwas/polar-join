from django.urls import path
from .views import CalculateView

urlpatterns = [
    path('api/calculate/', CalculateView.as_view(), name='calculate'),
]
