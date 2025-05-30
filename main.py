
import time
import board
import busio
import adafruit_dht
import requests
import os
import glob
from RPLCD.i2c import CharLCD

# 1. Inițializare
# Configurare DHT22 pe GPIO4
dht_device = adafruit_dht.DHT22(board.D4)

# Configurare LCD I2C
lcd = CharLCD('PCF8574', 0x27)
lcd.clear()

# Activare 1-Wire pentru DS18B20 (dacă nu e deja)
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

# Găsire senzor DS18B20
base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

def read_ds18b20():
    try:
        with open(device_file, 'r') as f:
            lines = f.readlines()
        if lines[0].strip()[-3:] != 'YES':
            return None
        equals_pos = lines[1].find('t=')
        if equals_pos != -1:
            temp_string = lines[1][equals_pos + 2:]
            return round(float(temp_string) / 1000.0, 1)
    except:
        return None

def display_lcd(temp_dht, hum, temp_ds):
    lcd.clear()
    lcd.write_string(f"T:{temp_dht}C H:{hum}%")
    lcd.crlf()
    lcd.write_string(f"DS18B20:{temp_ds}C")

def send_to_api(temp, hum):
    url = "http://localhost:3000/api/data"
    payload = {
        "temperature": temp,
        "humidity": hum
    }
    try:
        r = requests.post(url, json=payload)
        print("Date trimise:", r.status_code)
    except Exception as e:
        print("Eroare API:", e)

# 6. Loop
while True:
    try:
        temperature_dht = dht_device.temperature
        humidity = dht_device.humidity
        temperature_ds = read_ds18b20()

        print(f"DHT22: {temperature_dht}°C, {humidity}%")
        print(f"DS18B20: {temperature_ds}°C")

        display_lcd(temperature_dht, humidity, temperature_ds)
        send_to_api(temperature_dht, humidity)

    except Exception as e:
        print("Eroare la citire:", e)

    time.sleep(60)
