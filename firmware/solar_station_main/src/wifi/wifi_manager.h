#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebSocketsClient.h>

class WiFiManager {
private:
  String ssid;
  String password;
  bool connected = false;
  unsigned long lastConnectionAttempt = 0;
  uint8_t connectionAttempts = 0;
  const uint8_t MAX_ATTEMPTS = 20;
  const unsigned long RECONNECT_INTERVAL = 30000;  // 30 seconds
  
public:
  WiFiManager();
  
  void begin(const char* ssid, const char* password);
  void update();
  
  bool isConnected();
  bool reconnect();
  
  int8_t getRSSI();  // Signal strength
  uint8_t getAttempts();
  
  void setLowPowerMode();
  void setHighPowerMode();
};

#endif // WIFI_MANAGER_H
