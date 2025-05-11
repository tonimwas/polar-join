from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
import math

def calculate_polar(easting, northing):
    """
    Calculate distance and bearing using the Polar method
    Returns: (distance, bearing_from_north, bearing_from_east, full_circle)
    """
    delta_e = easting
    delta_n = northing
    
    # Calculate distance
    distance = math.sqrt(delta_e**2 + delta_n**2)
    
    # Calculate angle from East (mathematical angle)
    bearing_from_east = math.degrees(math.atan2(delta_n, delta_e))
    
    # Calculate full circle bearing
    full_circle = (bearing_from_east + 360) % 360
    
    # Convert to bearing from North
    if delta_e >= 0 and delta_n >= 0:  # NE quadrant
        bearing_from_north = 90 - bearing_from_east
    elif delta_e < 0 and delta_n >= 0:  # NW quadrant
        bearing_from_north = 360 - bearing_from_east
    elif delta_e < 0 and delta_n < 0:  # SW quadrant
        bearing_from_north = 180 + bearing_from_east
    else:  # SE quadrant
        bearing_from_north = 90 - bearing_from_east
    
    return distance, bearing_from_north, bearing_from_east, full_circle

def calculate_join(ea, na, eb, nb):
    """
    Calculate distance and bearing using the Join method
    Returns: (distance, bearing_from_north, bearing_from_east, full_circle, delta_e, delta_n)
    """
    delta_e = eb - ea
    delta_n = nb - na
    
    # Calculate distance
    distance = math.sqrt(delta_e**2 + delta_n**2)
    
    # Calculate angle from East (mathematical angle)
    bearing_from_east = math.degrees(math.atan2(delta_n, delta_e))
    
    # Calculate full circle bearing
    full_circle = (bearing_from_east + 360) % 360
    
    # Calculate bearing from North
    if delta_e >= 0 and delta_n >= 0:  # NE quadrant
        bearing_from_north = bearing_from_east
    elif delta_e >= 0 and delta_n < 0:  # SE quadrant
        bearing_from_north = 180 - bearing_from_east
    elif delta_e < 0 and delta_n < 0:  # SW quadrant
        bearing_from_north = 180 + bearing_from_east
    else:  # NW quadrant
        bearing_from_north = 360 + bearing_from_east
    
    return distance, bearing_from_north, bearing_from_east, full_circle, delta_e, delta_n


class CalculateView(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request):
        data = request.data
        result = {}
        
        if data.get('type') == 'polar':
            try:
                easting = float(data.get('easting', 0))
                northing = float(data.get('northing', 0))
                distance, bearing_from_north, bearing_from_east, full_circle = calculate_polar(easting, northing)
                # For polar, ΔE and ΔN are just easting and northing
                result = {
                    'distance': round(distance, 4),
                    'azimuth': round(bearing_from_north, 2),
                    'bearing_from_east': round(bearing_from_east, 2),
                    'delta_e': round(easting, 4),
                    'delta_n': round(northing, 4),
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
                distance, bearing_from_north, bearing_from_east, full_circle, delta_e, delta_n = calculate_join(ea, na, eb, nb)
                result = {
                    'distance': round(distance, 4),
                    'azimuth': round(bearing_from_north, 2),
                    'bearing_from_east': round(bearing_from_east, 2),
                    'delta_e': round(delta_e, 4),
                    'delta_n': round(delta_n, 4),
                    'method': 'join'
                }
            except (ValueError, TypeError) as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({'error': 'Invalid calculation type'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'result': result}, status=status.HTTP_200_OK)
