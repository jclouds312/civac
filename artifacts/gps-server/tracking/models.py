"""
CIVAC GPS Tracking Models
Real GPS chip tracking for cattle management
"""
from django.db import models
from django.utils import timezone


class GPSDevice(models.Model):
    """A physical GPS chip assigned to an animal."""

    TIPO_CHOICES = [
        ('collar-gps', 'Collar GPS-LTE'),
        ('collar-bt',  'Collar Bluetooth'),
        ('bolus',      'Bolo Ruminal GPS'),
        ('oreja',      'Caravana electrónica'),
    ]

    PLAN_CHOICES = [
        ('basico',  'Plan Básico'),
        ('pro',     'Plan PRO'),
        ('premium', 'Plan Premium'),
        ('platino', 'Plan Platino'),
    ]

    STATUS_CHOICES = [
        ('active',    'Activo'),
        ('inactive',  'Inactivo'),
        ('lost',      'Sin señal'),
        ('charging',  'Cargando'),
    ]

    # Identification
    nombre        = models.CharField(max_length=100, verbose_name='Nombre dispositivo')
    imei          = models.CharField(max_length=50, unique=True, verbose_name='IMEI / ID')
    tipo          = models.CharField(max_length=20, choices=TIPO_CHOICES, default='collar-gps')
    plan_required = models.CharField(max_length=20, choices=PLAN_CHOICES, default='pro')

    # Animal assignment
    animal_id     = models.CharField(max_length=20, blank=True, verbose_name='ID animal')
    animal_nombre = models.CharField(max_length=100, blank=True, verbose_name='Nombre animal')
    vinculado     = models.BooleanField(default=False, verbose_name='Vinculado a animal')
    fecha_vinculo = models.DateField(null=True, blank=True, verbose_name='Fecha de vínculo')
    potrero_id    = models.IntegerField(null=True, blank=True, verbose_name='Potrero actual')

    # Current position (cached from latest AnimalPosition)
    lat           = models.FloatField(null=True, blank=True, verbose_name='Latitud actual')
    lng           = models.FloatField(null=True, blank=True, verbose_name='Longitud actual')
    precision     = models.FloatField(null=True, blank=True, verbose_name='Precisión GPS (m)')
    velocidad     = models.FloatField(default=0.0, verbose_name='Velocidad km/h')
    altitud       = models.FloatField(null=True, blank=True, verbose_name='Altitud msnm')

    # Device status
    bateria       = models.IntegerField(default=100, verbose_name='Batería %')
    activo        = models.BooleanField(default=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    ultima_actualizacion = models.DateTimeField(default=timezone.now)
    fecha_registro = models.DateTimeField(default=timezone.now)

    # Connectivity
    network_type  = models.CharField(max_length=10, default='LTE', verbose_name='Tipo red')
    signal_strength = models.IntegerField(default=75, verbose_name='Señal %')
    firmware_version = models.CharField(max_length=20, default='3.2.1')

    class Meta:
        ordering = ['-activo', '-ultima_actualizacion']
        verbose_name = 'Dispositivo GPS'
        verbose_name_plural = 'Dispositivos GPS'

    def __str__(self):
        return f'{self.nombre} ({self.imei})'


class AnimalPosition(models.Model):
    """Historic GPS position record for an animal."""

    device       = models.ForeignKey(GPSDevice, on_delete=models.CASCADE, related_name='positions')
    lat          = models.FloatField()
    lng          = models.FloatField()
    precision    = models.FloatField(default=5.0)
    velocidad    = models.FloatField(default=0.0)
    altitud      = models.FloatField(null=True, blank=True)
    potrero_id   = models.IntegerField(null=True, blank=True)
    timestamp    = models.DateTimeField(default=timezone.now)
    source       = models.CharField(max_length=20, default='gps', choices=[
        ('gps',     'GPS automático'),
        ('manual',  'Entrada manual'),
        ('bt',      'Bluetooth'),
    ])

    class Meta:
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['device', '-timestamp'])]

    def __str__(self):
        return f'{self.device.nombre} @ {self.lat},{self.lng} ({self.timestamp})'


class GeoFence(models.Model):
    """Geographic boundary for alert generation."""

    TIPO_CHOICES = [
        ('circle',  'Circular'),
        ('potrero', 'Potrero'),
        ('custom',  'Personalizada'),
    ]

    nombre       = models.CharField(max_length=100)
    tipo         = models.CharField(max_length=20, choices=TIPO_CHOICES, default='circle')
    lat          = models.FloatField(verbose_name='Latitud centro')
    lng          = models.FloatField(verbose_name='Longitud centro')
    radio_metros = models.IntegerField(default=500, verbose_name='Radio (m)')
    potrero_id   = models.IntegerField(null=True, blank=True)
    activa       = models.BooleanField(default=True)
    descripcion  = models.TextField(blank=True)
    color        = models.CharField(max_length=10, default='#00c8ff')
    fecha_creacion = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-activa', 'nombre']

    def __str__(self):
        return f'{self.nombre} ({self.tipo})'


class GPSAlert(models.Model):
    """Alert triggered by geofence or device condition."""

    TIPO_CHOICES = [
        ('geofence_exit',  'Salida de geocerca'),
        ('geofence_enter', 'Entrada a geocerca'),
        ('battery_low',    'Batería baja'),
        ('signal_lost',    'Sin señal'),
        ('speed_exceeded', 'Velocidad alta'),
        ('animal_down',    'Animal caído'),
    ]

    SEVERIDAD_CHOICES = [
        ('info',     'Informativa'),
        ('warning',  'Advertencia'),
        ('critical', 'Crítica'),
    ]

    device     = models.ForeignKey(GPSDevice, on_delete=models.CASCADE, related_name='alerts')
    tipo       = models.CharField(max_length=30, choices=TIPO_CHOICES)
    severidad  = models.CharField(max_length=20, choices=SEVERIDAD_CHOICES, default='warning')
    mensaje    = models.TextField()
    lat        = models.FloatField(null=True, blank=True)
    lng        = models.FloatField(null=True, blank=True)
    timestamp  = models.DateTimeField(default=timezone.now)
    resuelta   = models.BooleanField(default=False)
    resuelta_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.tipo} — {self.device.nombre} ({self.timestamp})'
