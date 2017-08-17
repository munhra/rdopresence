#include <ESP8266WiFi.h>
#include <ArduinoOTA.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

//wifi

const char* ssid     = "FollowMe-Pi3";
const char* password = "FollowMeRadio";
const char* host = "192.168.42.1";

//sensor
#define TRIGGER 12
#define ECHO    13
#define WALL_DISTANCE 10

boolean sendPresenceDetected= true;
boolean sendPresenceNotDetected = true;

//the time we give the sensor to calibrate (10-60 secs according to the datasheet)
int calibrationTime = 30;        
//the time when the sensor outputs a low impulse
long unsigned int lowIn;        
//the amount of milliseconds the sensor has to be low
//before we assume all motion has stopped
long unsigned int pause = 5000; 
 
boolean lockLow = true;
boolean takeLowTime; 

boolean postPresenceOn = true;
boolean postPresenceOff = true;

int pirPin = 13;    //the digital pin connected to the PIR sensor's output
int ledPin = 0;
int pirValue = 0;

String roomName = "livingroom";

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  delay(100);
  setupWifi();
  sendRegister();
  setupFOTA();
  //setupPir();
  setupSonic();
}

void loop() {
  // put your main code here, to run repeatedly:
  ArduinoOTA.handle();
  //controlPirState(); 
  //controlSimplePirState();
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

void setupPir() {
  
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(pirPin, LOW);
  
  //give the sensor some time to calibrate
  Serial.print("calibrating sensor ");
    for(int i = 0; i < calibrationTime; i++){
      Serial.print(".");
      delay(1000);
      }
   Serial.println(" done");
   Serial.println("SENSOR ACTIVE");
   delay(50);
}

void setupFOTA() {
  // Port defaults to 8266
  // ArduinoOTA.setPort(8266);

  // Hostname defaults to esp8266-[ChipID]
     ArduinoOTA.setHostname("munhraESP8266");

  // No authentication by default
  // ArduinoOTA.setPassword((const char *)"123");

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
  
  if (distance < WALL_DISTANCE) {
  
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

void controlSimplePirState() {
  pirValue = digitalRead(pirPin);
  if (pirValue) 
  { 
    
    if (postPresenceOn) {
      postPresenceOn = false;
      postPresenceOff = true;
      Serial.println("Send post presence true");
      sendDetectionPost("1");
    }
    
    //Serial.println("==> Motion detected");
    digitalWrite(pirPin, LOW);
    //delay(500);
  
  }else{
    postPresenceOn = true;

    if (postPresenceOff) {
      Serial.println("Send post presence false");
      sendDetectionPost("0");
      postPresenceOff = false;  
      postPresenceOn = true;
    }
    
  }
  digitalWrite(ledPin, pirValue);
}

void controlPirState() {
     digitalWrite(ledPin, LOW);
     if(digitalRead(pirPin) == HIGH){
       digitalWrite(ledPin, HIGH);   //the led visualizes the sensors output pin state
       if(lockLow){ 
         //makes sure we wait for a transition to LOW before any further output is made:
         lockLow = false;           
         Serial.println("---");
         Serial.print("motion detected at ");
         sendDetectionPost("1");
         Serial.print(millis()/1000);
         Serial.println(" sec");
         delay(50);
         }        
         takeLowTime = true;
       }
 
     if(digitalRead(pirPin) == LOW){      
       digitalWrite(ledPin, LOW);  //the led visualizes the sensors output pin state
 
       if(takeLowTime){
        lowIn = millis();          //save the time of the transition from high to LOW
        takeLowTime = false;       //make sure this is only done at the start of a LOW phase
        }
       //if the sensor is low for more than the given pause,
       //we assume that no more motion is going to happen
       if(!lockLow && millis() - lowIn > pause){ 
           //makes sure this block of code is only executed again after
           //a new motion sequence has been detected
           lockLow = true;                       
           Serial.print("motion ended at ");      //output
           sendDetectionPost("0");
           Serial.print((millis() - pause)/1000);
           Serial.println(" sec");
           digitalWrite(ledPin, LOW);
           delay(50);
           }
       }
}

void sendRegister()
{
  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
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
  
  // Use WiFiClient class to create TCP connections
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
  /*
  delay(500);

   while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }*/
  
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

