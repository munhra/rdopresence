#include <ESP8266WiFi.h>
#include <ArduinoOTA.h>
#include <ESP8266mDNS.h>

//wifi
const char* ssid     = "FollowMe-Pi3";
const char* password = "FollowMeRadio";
const char* host = "192.168.42.1";

//sensor sonic
#define TRIGGER 12
#define ECHO    13
//#define WALL_DISTANCE 140 //Kitchen
#define WALL_DISTANCE 90 //bedroom
//#define WALL_DISTANCE 60 //bathroom
//#define WALL_DISTANCE 120 //livingroom
#define WALL_ERROR_ADJUST 30

boolean sendPresenceDetected= true;
boolean sendPresenceNotDetected = true;

String roomName = "bedroom";

void setup() {
  Serial.begin(115200);
  delay(100);
  setupWifi();
  sendRegister();
  setupFOTA();
  setupSonic();
}

void loop() {
  ArduinoOTA.handle();
  controlSimpleSonicState();
}

void setupWifi() {
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void setupSonic() {
  pinMode(TRIGGER, OUTPUT);
  pinMode(ECHO, INPUT);
}

void setupFOTA() {
  ArduinoOTA.setHostname("munhraESP8266");
  ArduinoOTA.onStart([]() {
    Serial.println("Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("Ready this one as uploaded by FOTA Sensor !!!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void controlSimpleSonicState() {
  long duration, distance;
  
  digitalWrite(TRIGGER, LOW);  
  delayMicroseconds(2); 
  
  digitalWrite(TRIGGER, HIGH);
  delayMicroseconds(10); 
  
  digitalWrite(TRIGGER, LOW);
  duration = pulseIn(ECHO, HIGH);
  distance = (duration/2) / 29.1;

  Serial.println(distance);
  
  if ((distance < WALL_DISTANCE) || (distance > WALL_DISTANCE + WALL_ERROR_ADJUST)){
  
    if (sendPresenceDetected) {
      Serial.println("send post detected");
      sendDetectionPost("1");
      sendPresenceDetected = false;
      sendPresenceNotDetected = true;
    }
    
  }else{

    if (sendPresenceNotDetected) {
      Serial.println("send post not detected");
      sendDetectionPost("0");
      sendPresenceDetected = true;
      sendPresenceNotDetected = false;
    }
  }
  delay(100);
}

void sendRegister()
{
  Serial.print("connecting to ");
  Serial.println(host);
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    ESP.restart();
    return;
  }
  String url = "/api/sensor/register?roomName="+roomName+"&mac="+getMacAddress()+"&ip="+ipToString(WiFi.localIP());
  Serial.print("Requesting URL: ");
  Serial.println(url);
  client.print(String("POST ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
  Serial.println();
  Serial.println("closing connection");
}

void sendDetectionPost(String detected) {
  Serial.print("connecting to ");
  Serial.println(host);
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    ESP.restart();
    return;
  }
  String url = "/api/sensor?roomName="+roomName+"&mac="+getMacAddress()+"&ip="+ipToString(WiFi.localIP())+"&presence="+detected;
  Serial.print("Requesting URL: ");
  Serial.println(url);
  client.print(String("POST ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
               
  Serial.println();
  Serial.println("closing connection");
}

String ipToString(IPAddress ip){
  String s="";
  for (int i=0; i<4; i++)
    s += i  ? "." + String(ip[i]) : String(ip[i]);
  return s;
}

String getMacAddress() {
  byte mac[6];
  WiFi.macAddress(mac);
  String cMac = "";
  for (int i = 0; i < 6; ++i) {
    if (mac[i]<0x10) {cMac += "0";
   }
  cMac += String(mac[i],HEX);
  if(i<5)
    cMac += ":"; // put : or - if you want byte delimiters
  }
  cMac.toUpperCase();
  return cMac;
}

