"""
CIVAC GPS Tracking — REST API Views
Django REST Framework views for GPS chip management
"""
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random, math

from .models import GPSDevice, AnimalPosition, GeoFence, GPSAlert
from .serializers import (
    GPSDeviceSerializer, GPSDeviceCreateSerializer,
    AnimalPositionSerializer, GeoFenceSerializer, GPSAlertSerializer,
)


# ── Plan limits helper ────────────────────────────────────────────────────
PLAN_LIMITS  = getattr(settings, 'GPS_PLAN_LIMITS',  {'basico':0,'pro':5,'premium':20,'platino':999})
PLAN_PRICES  = getattr(settings, 'GPS_PLAN_PRICES',  {'basico':0,'pro':129000,'premium':289000,'platino':890000})

GPS_CHIP_MODELS = [
    {'marca':'Nedap Livestock', 'modelo':'CowManager SensOor', 'tipo':'oreja',     'precio':320_000, 'plan_min':'pro',     'desc':'Sensor oreja IoT · temperatura · actividad · rumia'},
    {'marca':'HerdDogg',        'modelo':'Tag Pro LTE',         'tipo':'collar-gps','precio':580_000, 'plan_min':'pro',     'desc':'Collar GPS-LTE · geovallado · alertas en tiempo real'},
    {'marca':'Gallagher',       'modelo':'HR5 Collar',          'tipo':'collar-gps','precio':650_000, 'plan_min':'pro',     'desc':'GPS collar · integración báscula · peso estimado'},
    {'marca':'SmaXtec',         'modelo':'Bolus Rumen',         'tipo':'bolus',     'precio':480_000, 'plan_min':'premium', 'desc':'Bolo ruminal · temperatura interna · pH · gas'},
    {'marca':'Allflex',         'modelo':'SenseTime Ear Tag',   'tipo':'oreja',     'precio':280_000, 'plan_min':'pro',     'desc':'Caravana electrónica · RFID + GPS híbrido'},
    {'marca':'Tru-Test',        'modelo':'XRS2 GPS',            'tipo':'collar-gps','precio':720_000, 'plan_min':'premium', 'desc':'Collar pesaje integrado · GPS preciso · 5 años batería'},
    {'marca':'SCR by Allflex',  'modelo':'Heatime Pro+',        'tipo':'collar-bt', 'precio':390_000, 'plan_min':'pro',     'desc':'Collar Bluetooth · detección celo · actividad reproductiva'},
    {'marca':'Destron Fearing', 'modelo':'Mini GPS collar',     'tipo':'collar-gps','precio':420_000, 'plan_min':'pro',     'desc':'Collar compacto · batería 3 años · resistente al agua'},
]


def _simulate_position(base_lat: float, base_lng: float, potrero_id: int = 1):
    """Simulate realistic animal movement within a potrero."""
    spread = 0.003  # ~333m radius
    random.seed(potrero_id * 1000 + int(timezone.now().timestamp() / 120))
    return (
        base_lat + random.uniform(-spread, spread),
        base_lng + random.uniform(-spread, spread),
    )


# ── Views ─────────────────────────────────────────────────────────────────

class DeviceListCreateView(APIView):
    """GET /api/gps/devices/ — list all devices
       POST /api/gps/devices/ — register new device"""

    def get(self, request):
        plan   = request.query_params.get('plan', 'pro')
        limit  = PLAN_LIMITS.get(plan, 5)
        queryset = GPSDevice.objects.all()

        # Simulate position drift for active devices
        for dev in queryset:
            if dev.activo and dev.lat and dev.lng:
                new_lat, new_lng = _simulate_position(dev.lat, dev.lng, dev.potrero_id or 1)
                # Update only if > 15 seconds since last update
                diff = (timezone.now() - dev.ultima_actualizacion).total_seconds()
                if diff > 15:
                    dev.lat = round(new_lat, 7)
                    dev.lng = round(new_lng, 7)
                    dev.bateria = max(0, dev.bateria - random.randint(0, 1))
                    dev.ultima_actualizacion = timezone.now()
                    dev.save(update_fields=['lat', 'lng', 'bateria', 'ultima_actualizacion'])

        serializer = GPSDeviceSerializer(queryset, many=True)
        return Response({
            'ok':      True,
            'count':   queryset.count(),
            'plan':    plan,
            'limit':   limit,
            'usado':   queryset.filter(vinculado=True).count(),
            'devices': serializer.data,
        })

    def post(self, request):
        plan     = request.data.get('plan', 'pro')
        limit    = PLAN_LIMITS.get(plan, 5)
        current  = GPSDevice.objects.filter(vinculado=True).count()

        if current >= limit:
            return Response({
                'ok':    False,
                'error': f'Límite de {limit} chips GPS alcanzado para plan {plan.upper()}. Mejora tu plan para agregar más.',
                'limit': limit,
                'usado': current,
                'upgrade_to': 'premium' if plan == 'pro' else 'platino',
            }, status=status.HTTP_403_FORBIDDEN)

        ser = GPSDeviceCreateSerializer(data=request.data)
        if ser.is_valid():
            device = ser.save()
            return Response({
                'ok':     True,
                'device': GPSDeviceSerializer(device).data,
                'usado':  current + 1,
                'limit':  limit,
            }, status=status.HTTP_201_CREATED)
        return Response({'ok': False, 'errors': ser.errors}, status=status.HTTP_400_BAD_REQUEST)


class DeviceDetailView(APIView):
    """GET/PATCH/DELETE /api/gps/devices/{id}/"""

    def _get_device(self, pk):
        try:
            return GPSDevice.objects.get(pk=pk)
        except GPSDevice.DoesNotExist:
            return None

    def get(self, request, pk):
        dev = self._get_device(pk)
        if not dev:
            return Response({'ok': False, 'error': 'Dispositivo no encontrado'}, status=404)
        return Response({'ok': True, 'device': GPSDeviceSerializer(dev).data})

    def patch(self, request, pk):
        dev = self._get_device(pk)
        if not dev:
            return Response({'ok': False, 'error': 'Dispositivo no encontrado'}, status=404)
        ser = GPSDeviceCreateSerializer(dev, data=request.data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response({'ok': True, 'device': GPSDeviceSerializer(dev).data})
        return Response({'ok': False, 'errors': ser.errors}, status=400)

    def delete(self, request, pk):
        dev = self._get_device(pk)
        if not dev:
            return Response({'ok': False, 'error': 'Dispositivo no encontrado'}, status=404)
        nombre = dev.nombre
        dev.delete()
        return Response({'ok': True, 'message': f'Dispositivo {nombre} eliminado'})


class DevicePositionView(APIView):
    """POST /api/gps/devices/{pk}/position/ — record a new GPS fix"""

    def post(self, request, pk):
        try:
            dev = GPSDevice.objects.get(pk=pk)
        except GPSDevice.DoesNotExist:
            return Response({'ok': False, 'error': 'Dispositivo no encontrado'}, status=404)

        lat    = request.data.get('lat', dev.lat)
        lng    = request.data.get('lng', dev.lng)
        prec   = request.data.get('precision', 5.0)
        vel    = request.data.get('velocidad', 0.0)
        alt    = request.data.get('altitud', None)
        pot    = request.data.get('potrero_id', dev.potrero_id)
        source = request.data.get('source', 'gps')
        bat    = request.data.get('bateria', dev.bateria)

        pos = AnimalPosition.objects.create(
            device=dev, lat=lat, lng=lng, precision=prec,
            velocidad=vel, altitud=alt, potrero_id=pot, source=source,
        )

        # Update device cached position
        dev.lat = lat; dev.lng = lng; dev.precision = prec
        dev.velocidad = vel; dev.altitud = alt; dev.potrero_id = pot
        dev.bateria = bat; dev.ultima_actualizacion = timezone.now()
        dev.activo = True; dev.status = 'active'
        dev.save()

        # Auto-generate battery alert
        if bat <= 15 and not GPSAlert.objects.filter(device=dev, tipo='battery_low', resuelta=False).exists():
            GPSAlert.objects.create(
                device=dev, tipo='battery_low', severidad='critical' if bat <= 5 else 'warning',
                mensaje=f'Batería crítica en {dev.nombre}: {bat}%. Carga o reemplaza la batería.',
                lat=lat, lng=lng,
            )

        return Response({
            'ok':       True,
            'position': AnimalPositionSerializer(pos).data,
            'device':   GPSDeviceSerializer(dev).data,
        })


class DeviceHistoryView(APIView):
    """GET /api/gps/devices/{pk}/history/?limit=50"""

    def get(self, request, pk):
        try:
            dev = GPSDevice.objects.get(pk=pk)
        except GPSDevice.DoesNotExist:
            return Response({'ok': False, 'error': 'Dispositivo no encontrado'}, status=404)

        limit     = min(int(request.query_params.get('limit', 100)), 500)
        positions = dev.positions.all()[:limit]
        return Response({
            'ok':        True,
            'device_id': pk,
            'count':     positions.count(),
            'positions': AnimalPositionSerializer(positions, many=True).data,
        })


class GeoFenceListCreateView(APIView):
    """GET/POST /api/gps/geofences/"""

    def get(self, request):
        fences = GeoFence.objects.all()
        return Response({'ok': True, 'count': fences.count(), 'geofences': GeoFenceSerializer(fences, many=True).data})

    def post(self, request):
        ser = GeoFenceSerializer(data=request.data)
        if ser.is_valid():
            fence = ser.save()
            return Response({'ok': True, 'geofence': GeoFenceSerializer(fence).data}, status=201)
        return Response({'ok': False, 'errors': ser.errors}, status=400)


class GPSAlertListView(APIView):
    """GET /api/gps/alerts/?only_active=true"""

    def get(self, request):
        only_active = request.query_params.get('only_active', 'false').lower() == 'true'
        qs = GPSAlert.objects.all()
        if only_active:
            qs = qs.filter(resuelta=False)
        return Response({'ok': True, 'count': qs.count(), 'alerts': GPSAlertSerializer(qs[:50], many=True).data})

    def patch(self, request, pk):
        """Resolve an alert."""
        try:
            alert = GPSAlert.objects.get(pk=pk)
        except GPSAlert.DoesNotExist:
            return Response({'ok': False, 'error': 'Alerta no encontrada'}, status=404)
        alert.resuelta = True; alert.resuelta_en = timezone.now(); alert.save()
        return Response({'ok': True, 'alert': GPSAlertSerializer(alert).data})


class GPSStatsView(APIView):
    """GET /api/gps/stats/ — summary statistics"""

    def get(self, request):
        plan   = request.query_params.get('plan', 'pro')
        limit  = PLAN_LIMITS.get(plan, 5)
        total  = GPSDevice.objects.count()
        activos= GPSDevice.objects.filter(activo=True).count()
        vinc   = GPSDevice.objects.filter(vinculado=True).count()
        alerts = GPSAlert.objects.filter(resuelta=False).count()
        batt_low = GPSDevice.objects.filter(bateria__lte=20).count()
        lost   = GPSDevice.objects.filter(activo=False).count()

        return Response({
            'ok':         True,
            'plan':       plan,
            'limit':      limit,
            'usado':      vinc,
            'disponibles': max(0, limit - vinc),
            'stats': {
                'total_devices':    total,
                'activos':          activos,
                'vinculados':       vinc,
                'alertas_activas':  alerts,
                'bateria_baja':     batt_low,
                'sin_señal':        lost,
                'cobertura_pct':    round(activos / total * 100) if total > 0 else 0,
            },
        })


class GPSPlanInfoView(APIView):
    """GET /api/gps/plans/ — GPS plan limits & chip catalog"""

    def get(self, request):
        plans_info = []
        for plan_id, limit in PLAN_LIMITS.items():
            plans_info.append({
                'id':          plan_id,
                'limit':       limit,
                'precio_plan': PLAN_PRICES.get(plan_id, 0),
                'label':       {'basico':'Básico','pro':'PRO','premium':'Premium','platino':'Platino'}.get(plan_id, plan_id),
                'descripcion': {
                    'basico':  'Sin soporte GPS. Gestión manual de animales.',
                    'pro':     f'Hasta {PLAN_LIMITS["pro"]} chips GPS-LTE simultáneos.',
                    'premium': f'Hasta {PLAN_LIMITS["premium"]} chips con telemetría avanzada.',
                    'platino': 'Chips ilimitados + instancia dedicada.',
                }.get(plan_id, ''),
            })
        return Response({
            'ok':         True,
            'plans':      plans_info,
            'chip_catalog': GPS_CHIP_MODELS,
        })


class GPSHealthView(APIView):
    """GET /api/gps/health/"""

    def get(self, request):
        return Response({
            'ok':      True,
            'service': 'CIVAC GPS Server v1.0',
            'engine':  'Django 6 + DRF',
            'db':      'SQLite',
            'devices': GPSDevice.objects.count(),
            'ts':      timezone.now().isoformat(),
        })
