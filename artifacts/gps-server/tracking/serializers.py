"""DRF Serializers for CIVAC GPS Tracking."""
from rest_framework import serializers
from .models import GPSDevice, AnimalPosition, GeoFence, GPSAlert
from django.utils import timezone


class AnimalPositionSerializer(serializers.ModelSerializer):
    timestamp_iso = serializers.SerializerMethodField()

    class Meta:
        model  = AnimalPosition
        fields = ['id', 'lat', 'lng', 'precision', 'velocidad', 'altitud',
                  'potrero_id', 'timestamp', 'timestamp_iso', 'source']

    def get_timestamp_iso(self, obj):
        return obj.timestamp.isoformat()


class GPSDeviceSerializer(serializers.ModelSerializer):
    ultima_actualizacion_iso = serializers.SerializerMethodField()
    tiempo_desde_update      = serializers.SerializerMethodField()
    posicion_count           = serializers.SerializerMethodField()

    class Meta:
        model  = GPSDevice
        fields = [
            'id', 'nombre', 'imei', 'tipo', 'plan_required',
            'animal_id', 'animal_nombre', 'vinculado', 'fecha_vinculo', 'potrero_id',
            'lat', 'lng', 'precision', 'velocidad', 'altitud',
            'bateria', 'activo', 'status', 'network_type', 'signal_strength', 'firmware_version',
            'ultima_actualizacion', 'ultima_actualizacion_iso', 'tiempo_desde_update',
            'fecha_registro', 'posicion_count',
        ]

    def get_ultima_actualizacion_iso(self, obj):
        return obj.ultima_actualizacion.isoformat()

    def get_tiempo_desde_update(self, obj):
        """Returns seconds since last update."""
        delta = timezone.now() - obj.ultima_actualizacion
        return int(delta.total_seconds())

    def get_posicion_count(self, obj):
        return obj.positions.count()


class GPSDeviceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = GPSDevice
        fields = [
            'nombre', 'imei', 'tipo', 'plan_required',
            'animal_id', 'animal_nombre', 'vinculado', 'fecha_vinculo', 'potrero_id',
            'bateria', 'network_type',
        ]

    def validate_imei(self, value):
        if GPSDevice.objects.filter(imei=value).exists():
            raise serializers.ValidationError(f"El IMEI '{value}' ya está registrado.")
        return value


class GeoFenceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = GeoFence
        fields = ['id', 'nombre', 'tipo', 'lat', 'lng', 'radio_metros',
                  'potrero_id', 'activa', 'descripcion', 'color', 'fecha_creacion']


class GPSAlertSerializer(serializers.ModelSerializer):
    device_nombre = serializers.CharField(source='device.nombre', read_only=True)
    animal_nombre = serializers.CharField(source='device.animal_nombre', read_only=True)

    class Meta:
        model  = GPSAlert
        fields = ['id', 'device', 'device_nombre', 'animal_nombre',
                  'tipo', 'severidad', 'mensaje', 'lat', 'lng',
                  'timestamp', 'resuelta', 'resuelta_en']
