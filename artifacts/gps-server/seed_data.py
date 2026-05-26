"""
CIVAC GPS Server — seed initial data.
Run after migrate: python seed_data.py
"""
import os
import sys
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gps_server.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.utils import timezone
from tracking.models import GPSDevice, AnimalPosition, GeoFence, GPSAlert

BASE_LAT = 4.710988
BASE_LNG = -74.072092

if not GPSDevice.objects.exists():
    print("Seeding initial GPS devices…")

    devices = [
        dict(nombre='Collar Rosaura',  imei='354071230987654', tipo='collar-gps', plan_required='pro',
             animal_id='A-0042', animal_nombre='Rosaura',  vinculado=True, fecha_vinculo=date(2026,1,10),
             lat=4.710988, lng=-74.072092, precision=4, bateria=82,  activo=True, potrero_id=1,
             network_type='LTE', signal_strength=88, firmware_version='3.2.1',
             ultima_actualizacion=timezone.now() - timedelta(minutes=2)),
        dict(nombre='Collar Titan',    imei='354071230987655', tipo='collar-gps', plan_required='pro',
             animal_id='A-0622', animal_nombre='Titan',    vinculado=True, fecha_vinculo=date(2026,1,10),
             lat=4.711245, lng=-74.071887, precision=5, bateria=64,  activo=True, potrero_id=5,
             network_type='LTE', signal_strength=76, firmware_version='3.2.1',
             ultima_actualizacion=timezone.now() - timedelta(minutes=1)),
        dict(nombre='Bolo Perla',      imei='354071230987656', tipo='bolus',      plan_required='premium',
             animal_id='A-0712', animal_nombre='Perla',    vinculado=True, fecha_vinculo=date(2026,2,15),
             lat=4.710502, lng=-74.072341, precision=8, bateria=17,  activo=True, potrero_id=1,
             network_type='NB-IoT', signal_strength=62, firmware_version='2.8.4',
             ultima_actualizacion=timezone.now() - timedelta(seconds=30)),
        dict(nombre='Caravana Bravo',  imei='RFID-ISO-40042',  tipo='oreja',      plan_required='pro',
             animal_id='A-0401', animal_nombre='Bravo',    vinculado=True, fecha_vinculo=date(2026,3,1),
             lat=4.711019, lng=-74.072501, precision=3, bateria=8,   activo=False, potrero_id=4,
             network_type='BLE', signal_strength=0, firmware_version='1.9.0', status='lost',
             ultima_actualizacion=timezone.now() - timedelta(hours=1)),
        dict(nombre='Collar Luna',     imei='354071230987657', tipo='collar-gps', plan_required='pro',
             animal_id='A-0503', animal_nombre='Luna',     vinculado=True, fecha_vinculo=date(2026,3,15),
             lat=4.711500, lng=-74.071200, precision=6, bateria=91,  activo=True, potrero_id=3,
             network_type='LTE', signal_strength=93, firmware_version='3.2.1',
             ultima_actualizacion=timezone.now() - timedelta(seconds=45)),
        dict(nombre='Collar Estrella', imei='BT:A1:B2:C3:D4',  tipo='collar-bt', plan_required='pro',
             animal_id='A-0201', animal_nombre='Estrella', vinculado=True, fecha_vinculo=date(2026,4,1),
             lat=4.710700, lng=-74.072200, precision=12, bateria=55, activo=True, potrero_id=1,
             network_type='BLE', signal_strength=71, firmware_version='3.0.2',
             ultima_actualizacion=timezone.now() - timedelta(minutes=1, seconds=30)),
    ]

    created_devs = []
    for d in devices:
        dev, _ = GPSDevice.objects.update_or_create(imei=d['imei'], defaults=d)
        created_devs.append(dev)

        # Create 10 initial position history records
        import random
        for i in range(10):
            AnimalPosition.objects.create(
                device=dev,
                lat=d['lat'] + random.uniform(-0.002, 0.002),
                lng=d['lng'] + random.uniform(-0.002, 0.002),
                precision=d['precision'],
                velocidad=random.uniform(0, 4),
                potrero_id=d['potrero_id'],
                timestamp=timezone.now() - timedelta(minutes=i*15),
            )

    # Seed geofences (one per potrero)
    potreros = [
        ('Potrero 1 — Kikuyo',    BASE_LAT+0.001, BASE_LNG+0.001, 200, 1, '#22c55e'),
        ('Potrero 2 — Raigrás',  BASE_LAT+0.001, BASE_LNG+0.005, 200, 2, '#3b82f6'),
        ('Potrero 3 — Brachiaria',BASE_LAT-0.001, BASE_LNG+0.005, 250, 3, '#f97316'),
        ('Potrero 4 — Estrella',  BASE_LAT+0.003, BASE_LNG,       200, 4, '#a855f7'),
        ('Potrero 5 — Nativo',    BASE_LAT,       BASE_LNG+0.003, 300, 5, '#ec4899'),
        ('Potrero 6 — Kikuyo 2', BASE_LAT+0.003, BASE_LNG+0.005, 180, 6, '#14b8a6'),
    ]
    for nombre, lat, lng, radio, pid, color in potreros:
        GeoFence.objects.get_or_create(potrero_id=pid, defaults=dict(
            nombre=nombre, tipo='potrero', lat=lat, lng=lng,
            radio_metros=radio, color=color, activa=True,
        ))

    # Seed critical alerts
    bravo = GPSDevice.objects.get(imei='RFID-ISO-40042')
    GPSAlert.objects.get_or_create(device=bravo, tipo='signal_lost', resuelta=False, defaults=dict(
        severidad='critical',
        mensaje='Caravana Bravo sin señal hace más de 1 hora. Última posición: Potrero 4.',
        lat=4.711019, lng=-74.072501,
    ))
    perla = GPSDevice.objects.get(imei='354071230987656')
    GPSAlert.objects.get_or_create(device=perla, tipo='battery_low', resuelta=False, defaults=dict(
        severidad='critical',
        mensaje='Bolo Perla con batería al 17%. Recarga o reemplaza antes de que se agote.',
        lat=4.710502, lng=-74.072341,
    ))

    print(f"  ✓ {GPSDevice.objects.count()} dispositivos GPS creados")
    print(f"  ✓ {AnimalPosition.objects.count()} posiciones históricas")
    print(f"  ✓ {GeoFence.objects.count()} geocercas (potreros)")
    print(f"  ✓ {GPSAlert.objects.count()} alertas iniciales")
else:
    print(f"  → DB already has {GPSDevice.objects.count()} GPS devices. Skipping seed.")

print("GPS Server ready.")
