# rdopresence

## Arquitetura do projeto

![screen shot 2017-09-11 at 08 52 53](https://user-images.githubusercontent.com/7031566/30274248-f74bfc4a-96d2-11e7-8fb8-8df40ebdb87b.png)

Sensor Ultrasonico | Comodo        | WALL_DISTANCE_LOW | WALL_DISTANCE_HIGH |MAC ADDRESS
------------------ | ------------- | ----------------- | ------------------ |-----------------
U1                 | Quarto        | 75                | 120                |5C:CF:7F:D5:D0:35
U2                 | Banheiro      | 60                | 60                 |5C:CF:7F:D5:D0:56
U3                 | Sala Direita  | 70                | 145                |5C:CF:7F:8F:77:E4
U4                 | Sala Esquerda | 55                | 130                |5C:CF:7F:8F:74:CF
I1                 | Cozinha       | -                 | -                  |5C:CF:7F:8F:74:F4
R1                 | Garagem       | -                 | -                  |5C:CF:7F:8F:6E:83

## Configuração da rede do raspberry

- Usuário: pi e senha:FollowMeRadio para acessar o RaspBerry 
- O SSID da rede criada pelo raspberry para o projeto é FollowMe-Pi3
- A senha da rede wifi criada pelo raspberry é FollowMeRadio
- O IP fixo do raspberry é 192.168.42.1 
- O servidor backend está em 192.168.42.1:3000
- O Frontend está em 192.168.42.1:4200
- Reboot script cofigurado com o crontab
- Caminho do servidor no Raspberry
   
   ```/home/pi/FollowingMeRadio/rdopresence/raspberry-server/server.js```

- Acessar remotamente o Raspberry do Linux/MAC, usurio pi senha FollowMeRadio

   ``` open afp://192.168.42.1 ```


## Circuito do sensor ultrasonico

![Circuito do sensor ultrasonico](https://user-images.githubusercontent.com/7031566/29665992-e6616d90-88ac-11e7-9a0f-457249b6a5aa.png)

## FOTA com arduino

1. Localize a ferramenta esptool, no MAC OS X o caminho é o seguinte:
~/Library/Arduino15/packages/esp8266/tools
Não consegui rodar o FOTA pela interface do Arduino no MAC tive que rodar na mão mesmo, veja a baixo os comandos

Ative na IDE o modo verboso para saber onde foi parar o firmware compilado.
Mostrar mensagem de saida durante

Vá até o diretorio 
/Users/vntraal/Library/Arduino15/packages/esp8266/hardware/esp8266/2.3.0/tools
Rode o comando espota.py
python espota.py  -i 192.168.2.25 -p 8266 -f /var/folders/pl/jqh4v7s54gl766rjxnv2k_zhtf6y0l/t/arduino_build_562325/BasicOTA.ino.bin

## Links de referencia

* ESP8266 tutorial

  * https://learn.adafruit.com/adafruit-feather-huzzah-esp8266/overview

* conectar o ESP8266 

  * http://www.instructables.com/id/IoT-Motion-Detector-With-NodeMCU-and-BLYNK/
  * https://www.mpja.com/download/31227sc.pdf
  * https://www.youtube.com/watch?v=mTbMg6J6ETk

* Light a led

  * http://www.instructables.com/id/HOW-TO-BLINK-LED-USING-ESP8266/
  * https://iot-playground.com/blog/2-uncategorised/38-esp8266-and-arduino-ide-blink-example

* RGB LED

  * https://learn.adafruit.com/remote-control-with-the-huzzah-plus-adafruit-io/monitor-wiring

* Simple LED

  * https://learn.adafruit.com/micropython-basics-blink-a-led
  * https://learn.adafruit.com/adafruit-guide-excellent-soldering
  * https://www.adafruit.com/product/136

* Conexão com o huzzafeather modificando para 3v Como transformar a alimentação em 3V do PIR HCSR501

  * https://www.youtube.com/watch?v=mTbMg6J6ETk
  * https://www.youtube.com/watch?v=Jy-4Xcv4h_Y

* Testar com o Arduino 

  * http://www.instructables.com/id/PIR-Motion-Sensor-Tutorial/
  * https://www.youtube.com/watch?v=FxaTDvs34mM

* Codigo arduino
  
  * http://www.circuitmagic.com/arduino/pir-motion-sensor-with-arduino/
  
* Huzzfeather led
  
  * https://www.digikey.com/en/maker/blogs/hands-on-with-the-adafruit-feather-huzzah-esp8266-iot-kit/54cd739f6dc149b184547d85c866511f

* Motion Detector com led

  * http://www.instructables.com/id/IoT-Motion-Detector-With-NodeMCU-and-BLYNK/
  * http://esp8266.github.io/Arduino/versions/2.0.0/doc/ota_updates/ota_updates.html
  * https://github.com/esp8266/Arduino/issues/1039

* Reprodutor de wav arduino
  
  * https://www.arduino.cc/en/Tutorial/SimpleAudioPlayer

* Solução completa tocador de MP3 com o ESP8266
  
  * http://www.instructables.com/id/WiFi-Enabled-MP3-Player-Using-the-ESP8266-Module-a/

* Chip que usa protocola I2S (especifico de som)

  * https://www.adafruit.com/product/3006

* Turn a RaspBerryPi 3 into a WiFi router-hotspot

  * https://medium.com/@edoardo849/turn-a-raspberrypi-3-into-a-wifi-router-hotspot-41b03500080e

* Como conectar o sensor ultrasonico
  
  * https://www.14core.com/wiring-esp8266-nodemcu-with-hcsr04-ultrasonic-sensor/

* Especificação sensor Ultrasonico

  * http://www.micropik.com/PDF/HCSR04.pdf

* Especificação do sensor PIR SR501
  
  * https://www.mpja.com/download/31227sc.pdf
