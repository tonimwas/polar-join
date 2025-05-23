from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from django.views.generic import View
from django.http import HttpResponse
import os
import math

class FrontendAppView(View):
    def get(self, request):
        try:
            with open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist', 'index.html')) as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse(
                """
                index.html not found! Build your React app!!
                """,
                status=501,
            )

def calculate_polar(distance, use_azimuth, degrees, minutes, seconds, angle):
    """
    Calculate ΔE and ΔN from distance and direction
    Returns: (delta_e, delta_n, azimuth, bearing_from_east)
    """
    if use_azimuth:
        # Convert DMS to decimal degrees
        azimuth = float(degrees) + float(minutes)/60 + float(seconds)/3600
        # Convert azimuth to bearing from East
        bearing_from_east = 90 - azimuth
    else:
        bearing_from_east = float(angle) if angle is not None else 0.0
        # Convert bearing from East to azimuth
        azimuth = (90 - bearing_from_east) % 360

    # Calculate ΔE and ΔN from distance and bearing
    delta_e = distance * math.cos(math.radians(bearing_from_east))
    delta_n = distance * math.sin(math.radians(bearing_from_east))
    
    return delta_e, delta_n, azimuth, bearing_from_east


def calculate_join(ea, na, eb, nb):
    """
    Calculate distance and bearing using the Join method
    Returns: (distance, azimuth, bearing_from_east, delta_e, delta_n)
    """
    delta_e = eb - ea
    delta_n = nb - na
    
    # Calculate distance
    distance = math.sqrt(delta_e**2 + delta_n**2)
    
    # Calculate angle from East (mathematical angle)
    bearing_from_east = math.degrees(math.atan2(delta_n, delta_e))
    
    # Normalize bearing_from_east to [0, 360)
    bearing_from_east_norm = (bearing_from_east + 360) % 360
    
    # Calculate azimuth (full-circle from North, clockwise)
    azimuth = (90 - bearing_from_east) % 360
    
    return distance, azimuth, bearing_from_east, delta_e, delta_n


class CalculateView(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request):
        data = request.data
        result = {}
        
        if data.get('type') == 'polar':
            try:
                # We will calculate easting and northing from distance and direction
                distance = float(data.get('distance', 0))
                use_azimuth = bool(data.get('useAzimuth', False))
                
                # Helper function for safe conversion to float
                def safe_float(val, default=0.0):
                    if val in (None, '', ' '):
                        return default
                    try:
                        return float(val)
                    except (ValueError, TypeError):
                        return default
                
                if use_azimuth:
                    # Using Azimuth (DMS) input
                    degrees = safe_float(data.get('degrees', 0))
                    minutes = safe_float(data.get('minutes', 0))
                    seconds = safe_float(data.get('seconds', 0))
                    angle = None  # Not used when using azimuth
                else:
                    # Using angle from East input
                    angle = safe_float(data.get('angle', 0))
                    degrees = minutes = seconds = 0  # Set to 0, not None

                delta_e, delta_n, azimuth, bearing_from_east = calculate_polar(
                    distance, use_azimuth, degrees, minutes, seconds, angle
                )

                result = {
                    'distance': round(distance, 4),
                    'azimuth': round(azimuth, 8),
                    'bearing_from_east': round(bearing_from_east, 8),
                    'delta_e': round(delta_e, 4),
                    'delta_n': round(delta_n, 4),
                    'method': 'polar'
                }
            except (ValueError, TypeError) as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        elif data.get('type') == 'join':
            try:
                ea = float(data.get('ea', 0))
                na = float(data.get('na', 0))
                eb = float(data.get('eb', 0))
                nb = float(data.get('nb', 0))
                distance, azimuth, bearing_from_east, delta_e, delta_n = calculate_join(ea, na, eb, nb)
                result = {
                    'distance': round(distance, 4),
                    'azimuth': round(azimuth, 8),
                    'bearing_from_east': round(bearing_from_east, 8),
                    'delta_e': round(delta_e, 4),
                    'delta_n': round(delta_n, 4),
                    'method': 'join'
                }
            except (ValueError, TypeError) as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'error': 'Invalid calculation type'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'result': result}, status=status.HTTP_200_OK)
