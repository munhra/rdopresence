#include <ESP8266WiFi.h>
#include <ArduinoOTA.h>
#include <ESP8266mDNS.h>

//wifi
const char* ssid     = "FollowMe-Pi3";
const char* password = "FollowMeRadio";
const char* host = "192.168.42.1";

#define DEBUG true

//sensor sonic
#define TRIGGER 12
#define ECHO    13

//#define WALL_DISTANCE_LOW 150 //Kitchen 
//#define WALL_DISTANCE_HIGH 199 //Kitchen 

//#define WALL_DISTANCE 90 //bedroom
//#define WALL_DISTANCE_LOW 89 //bedroom
//#define WALL_DISTANCE_HIGH 98 //bedroom

//define WALL_DISTANCE 110 //livingroom left
//#define WALL_DISTANCE_LOW 170 //livingroom right was 145
//#define WALL_DISTANCE_HIGH 175 //livingroom right was 145

//define WALL_DISTANCE 110 //livingroom right
#define WALL_DISTANCE_LOW 170 //livingroom right was 145
#define WALL_DISTANCE_HIGH 180 //livingroom right was 145

//old firmware working
//#define WALL_DISTANCE 60 //bathroom

//#define WALL_ERROR_ADJUST 150 //delay removal test
//#define FOTA_HOST_NAME "FutureHousePresenceBedroom" //192.168.42.19
#define FOTA_HOST_NAME "FutureHousePresenceLivingRight"
//#define FOTA_HOST_NAME "FutureHousePresenceLivingLeft"
//#define FOTA_HOST_NAME "FutureHousePresenceKitchen"
//#define FOTA_HOST_NAME "FutureHousePresenceBathroom"

boolean sendPresenceDetected= true;
boolean sendPresenceNotDetected = true;

//String roomName = "kitchen";
//String roomName = "bedroom";
String roomName = "livingroom";
//String roomName = "bathroom";

//Calibration measures
int arraySize = 100;
int standBydistanceArray[100];
float standByAverageDistance = 0;
int standByMaxDistance = 0;
int standByMinDistance = 100000;
int standByDistanceIndex = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  setupWifi();
  sendRegister();
  setupFOTA();
  setupSonic();
  resetStandByMeasures();
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
  ArduinoOTA.setHostname(FOTA_HOST_NAME);
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
  registerStandByDistance(distance);

  if ((distance < WALL_DISTANCE_LOW) || (distance > WALL_DISTANCE_HIGH)){
    
    if (sendPresenceDetected) {
      Serial.println("send post detected");
      calculateStandByMeasures();
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

void sendDebugPost(String detected) {
  Serial.print("connecting to ");
  Serial.println(host);
  WiFiClient client;
  const int httpPort = 3000;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
  }
  String url = "/api/sensor/debug?roomName="+roomName+"&mac="+getMacAddress()+"&ip="+ipToString(WiFi.localIP())+"&presence="+detected+
               "&maxdistance="+String(standByMaxDistance)+
               "&mindistance="+String(standByMinDistance)+
               "&averagedistance="+String(standByAverageDistance);            
  Serial.print("Requesting URL: ");
  Serial.println(url);
  client.print(String("POST ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");
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

//Measures

void resetStandByMeasures() {
  for (int i = 0 ; i < arraySize; i++) { //sizeof(standBydistanceArray)
    standBydistanceArray[i] = 0;
  }
  standByMaxDistance = 0;
  standByMinDistance = 100000;
  standByDistanceIndex = 0;
  standByAverageDistance = 0;
}

void registerStandByDistance(int distance) {
  if (standBydistanceArray[arraySize - 1] != 0) {
    calculateStandByMeasures();
    if (DEBUG) {
      sendDebugPost("0");  
    }
    resetStandByMeasures();
  }else{
    standBydistanceArray[standByDistanceIndex] = distance;
    standByDistanceIndex++;
  }
}

void calculateStandByMeasures()
{
    Serial.println("calculateStandByMeasures");
    int nonZeroesPositionCounter = 1;
    int totalDistance = 0;
    for (int i = 0 ; i < arraySize; i++) {
      if (!standBydistanceArray[i] == 0) {
        totalDistance = totalDistance + standBydistanceArray[i];
        nonZeroesPositionCounter++;
        if (standByMinDistance > standBydistanceArray[i]){
          standByMinDistance = standBydistanceArray[i];
        }
        if (standByMaxDistance < standBydistanceArray[i]){
          standByMaxDistance = standBydistanceArray[i];
        }
      }
    }
    
    standByAverageDistance =  totalDistance / nonZeroesPositionCounter;    
  
    Serial.println("calculateStandByMeasures last measures maxdistance "+String(standByMaxDistance));
    Serial.println("calculateStandByMeasures last measures mindistance "+String(standByMinDistance));
    Serial.println("calculateStandByMeasures last measures average "+String(standByAverageDistance,3));
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

