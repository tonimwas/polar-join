from rest_framework import serializers

class PolarInputSerializer(serializers.Serializer):
    type = serializers.CharField()
    r = serializers.FloatField(required=False)
    theta = serializers.FloatField(required=False)
    x1 = serializers.FloatField(required=False)
    y1 = serializers.FloatField(required=False)
    x2 = serializers.FloatField(required=False)
    y2 = serializers.FloatField(required=False)
