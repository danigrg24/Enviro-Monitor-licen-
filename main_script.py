import time
import board
import adafruit_dht
import RPi.GPIO as GPIO
import glob
import os 
import requests
from datetime import datetime

# === CONFIGURARE GPIO ===
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# === DEFINIRE PINI ===
PIN_DHT = 17
PIN_DS = 4
LED_ROSU = 18
LED_VERDE = 27
BUZZER = 23
BTN_INC = 24
BTN_STOP = 25

# === SETUP PINI ===
GPIO.setup(LED_ROSU, GPIO.OUT)
GPIO.setup(LED_VERDE, GPIO.OUT)
GPIO.setup(BUZZER, GPIO.OUT)
GPIO.setup(BTN_INC, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(BTN_STOP, GPIO.IN, pull_up_down=GPIO.PUD_UP)


# === INIȚIALIZARE SENZORI ===
dht_sensor = adafruit_dht.DHT22(board.D17)

base_dir = '/sys/bus/w1/devices/'
try:

    device_folder = glob.glob(base_dir + '28*')[0]
    device_file = device_folder + '/w1_slave'
except IndexError:
    print("⚠️ Eroare: Senzorul DS18B20 nu a fost găsit.")
    device_file = None

# === VARIABILE CONTROL ===
running = True
threshold_temp = 25
profil_temperaturi = [24, 26, 28]

# === FUNCȚII UTILE ===
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

def trimite_date_server(temp, hum):
    try:
        url = "http://127.0.0.1:3000/api/data"  # Înlocuiește cu IP-ul serverului tău (sau localhost dacă rulezi pe același device)
        payload = {"temperature": temp, "humidity": hum}
        r = requests.post(url, json=payload, timeout=2)
        if r.status_code == 200:
            print(f"[{datetime.now()}] Date trimise cu succes către server.")
        else:
            print(f"[{datetime.now()}] Eroare la trimitere: {r.status_code} {r.text}")
    except Exception as e:
        print(f"[{datetime.now()}] Eroare conexiune server: {e}")

def increment_threshold(channel):
    global threshold_temp
    threshold_temp += 1
    print(f"[{datetime.now()}] Prag temperatură crescut: {threshold_temp}°C")

def stop_program(channel):
    global running
    running = False
    print(f"[{datetime.now()}] Program oprit din buton.")

# === EVENT DETECT PE BUTOANE ===
GPIO.add_event_detect(BTN_INC, GPIO.FALLING, callback=increment_threshold, bouncetime=300)
GPIO.add_event_detect(BTN_STOP, GPIO.FALLING, callback=stop_program, bouncetime=300)

# === LOOP PRINCIPAL ===
print("🔄 Pornim monitorizarea...")

while running:
    try:
        temp_dht = dht_sensor.temperature
        hum_dht = dht_sensor.humidity
        temp_ds = read_ds18b20()

        print(f"[{datetime.now()}] DHT22: {temp_dht}°C / {hum_dht}%  |  DS18B20: {temp_ds}°C")

        # Trimite datele către server DOAR dacă ambele valori sunt valide
        if temp_dht is not None and hum_dht is not None:
            trimite_date_server(temp_dht, hum_dht)

        # === ALGORITM REGLARE ===
        if (temp_dht is not None and temp_dht > threshold_temp) or (temp_ds is not None and temp_ds > threshold_temp):
            GPIO.output(LED_ROSU, True)
            for _ in range(3):
                GPIO.output(BUZZER, True)
                time.sleep(0.2)
                GPIO.output(BUZZER, False)
                time.sleep(0.2)
        else:

            GPIO.output(LED_ROSU, False)
            GPIO.output(BUZZER, False)

        # === PROFIL DE FUNCȚIONARE ===
        for temperatura_setata in profil_temperaturi:
            if not running:
                break
            print(f"[{datetime.now()}] Setare profil: {temperatura_setata}°C")
            GPIO.output(LED_VERDE, True)
            time.sleep(2)
            GPIO.output(LED_VERDE, False)
            time.sleep(1)

        time.sleep(2)

    except Exception as e:
        print(f"⚠️ Eroare: {e}")
        time.sleep(2)

# === CURĂȚARE GPIO ===
GPIO.cleanup()
print("✅ Script încheiat. GPIO resetat.")
