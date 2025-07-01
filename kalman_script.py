import time
import board
import adafruit_dht
import RPi.GPIO as GPIO
import glob
import requests
from datetime import datetime

# === CONFIGURARE GPIO ===
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# === DEFINIRE PINI ===
LED_VERDE = 27

GPIO.setup(LED_VERDE, GPIO.OUT)

# === INIȚIALIZARE SENZORI ===
dht_sensor = adafruit_dht.DHT22(board.D17)

base_dir = '/sys/bus/w1/devices/'
try:
    device_folder = glob.glob(base_dir + '28*')[0]
    device_file = device_folder + '/w1_slave'
except IndexError:
    print("Eroare: Senzorul DS18B20 nu a fost găsit.")
    device_file = None

def read_ds18b20():
    if not device_file:
        return None
    try:
        with open(device_file, 'r') as f:
            lines = f.readlines()
        if lines[0].strip()[-3:] != 'YES':
            return None
        equals_pos = lines[1].find('t=')
        if equals_pos != -1:
            return float(lines[1][equals_pos + 2:]) / 1000.0
    except IOError:
        return None

def trimite_date_server(temp, hum, temp_ds=None):
    try:
        url = "http://192.168.137.1:3000/api/data"  # Înlocuiește cu IP-ul serverului tău
        payload = {"temperature": temp, "humidity": hum}
        if temp_ds is not None:
            payload["temp_ds"] = temp_ds
        r = requests.post(url, json=payload, timeout=2)
        if r.status_code == 200:
            print(f"[{datetime.now()}] Date trimise cu succes către server.")
        else:
            print(f"[{datetime.now()}] Eroare la trimitere: {r.status_code} {r.text}")
    except Exception as e:
        print(f"[{datetime.now()}] Eroare conexiune server: {e}")

# === CLASĂ FILTRU KALMAN ===
class KalmanFilter:
    def __init__(self, process_variance, measurement_variance, initial_estimate=0):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.estimate = initial_estimate
        self.error_estimate = 1.0

    def update(self, measurement):
        kalman_gain = self.error_estimate / (self.error_estimate + self.measurement_variance)
        self.estimate = self.estimate + kalman_gain * (measurement - self.estimate)
        self.error_estimate = (1.0 - kalman_gain) * self.error_estimate + self.process_variance
        return self.estimate

# === FILTRE KALMAN ===
kf_temp_dht = KalmanFilter(0.01, 0.2)
kf_hum_dht = KalmanFilter(0.01, 0.4)
kf_temp_ds = KalmanFilter(0.01, 0.2)

print("🔄 Pornim monitorizarea...")

try:
    while True:
        temp_dht = dht_sensor.temperature
        hum_dht = dht_sensor.humidity
        temp_ds = read_ds18b20()

        # Aplică filtrarea Kalman dacă valorile sunt valide
        if temp_dht is not None:
            temp_dht = kf_temp_dht.update(temp_dht)
        if hum_dht is not None:
            hum_dht = kf_hum_dht.update(hum_dht)
        if temp_ds is not None:
            temp_ds = kf_temp_ds.update(temp_ds)

        print(f"[{datetime.now()}] DHT22: {temp_dht}°C / {hum_dht}%  |  DS18B20: {temp_ds}°C")

        # Trimite datele către server DOAR dacă valorile DHT sunt valide
        if temp_dht is not None and hum_dht is not None:
            trimite_date_server(temp_dht, hum_dht, temp_ds)
            GPIO.output(LED_VERDE, True)
        else:
            GPIO.output(LED_VERDE, False)

        time.sleep(2)

except KeyboardInterrupt:
    print("Script oprit manual.")
except Exception as e:
    print(f"Eroare: {e}")
finally:
    GPIO.cleanup()
    print("Script încheiat. GPIO resetat.")