# rdopresence

## Configuração da rede do raspberry

- Usuário: pi e senha:FollowMeRadio para acessar o RaspBerry 
- O SSID da rede criada pelo raspberry para o projeto é FollowMe-Pi3
- A senha da rede wifi criada pelo raspberry é FollowMeRadio
- O IP fixo do raspberry é 192.168.42.1 
- O servidor backend está em 192.168.42.1:3000
- O Frontend está em 192.168.42.1:4200

## FOTA com arduino

esptool
/Users/vntraal/Library/Arduino15/packages/esp8266/tools

Não consegui rodar o FOTA pela interface do Arduino no MAC tive que rodar na mão mesmo, veja a baixo os comandos

Ative na IDE o modo verboso para saber onde foi parar o firmware compilado.
Mostrar mensagem de saida durante

Vá até o diretorio 
/Users/vntraal/Library/Arduino15/packages/esp8266/hardware/esp8266/2.3.0/tools
Rode o comando espota.py
python espota.py  -i 192.168.2.25 -p 8266 -f /var/folders/pl/jqh4v7s54gl766rjxnv2k_zhtf6y0l/t/arduino_build_562325/BasicOTA.ino.bin

## Links de referencia

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
