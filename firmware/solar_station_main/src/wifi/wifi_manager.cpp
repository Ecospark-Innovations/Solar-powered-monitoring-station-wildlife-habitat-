#include "wifi_manager.h"
#include "../config.h"

WiFiManager::WiFiManager() {
}

void WiFiManager::begin(const char* ssidIn, const char* passwordIn) {
  ssid = ssidIn;
  password = passwordIn;
  
  Serial.println("[WiFi] Starting WiFi connection...");
  WiFi.mode(WIFI_STA);
  WiFi.setHostname("solar-station-001");
  WiFi.setAutoConnect(true);
  WiFi.setAutoReconnect(true);
  
  WiFi.begin(ssid.c_str(), password.c_str());
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - startTime) < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    connected = true;
    Serial.println("\n[WiFi] Connected!");
    Serial.printf("[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("[WiFi] RSSI: %d dBm\n", WiFi.RSSI());
  } else {
    connected = false;
    Serial.println("\n[WiFi] Connection failed");
  }
}

void WiFiManager::update() {
  if (WiFi.status() != WL_CONNECTED) {
    if (!connected) {
      // Already disconnected
      return;
    }
    
    connected = false;
    Serial.println("[WiFi] Disconnected!");
    
    // Attempt reconnection
    if (millis() - lastConnectionAttempt > RECONNECT_INTERVAL) {
      reconnect();
    }
  } else {
    connected = true;
  }
}

bool WiFiManager::isConnected() {
  return connected && (WiFi.status() == WL_CONNECTED);
}

bool WiFiManager::reconnect() {
  connectionAttempts++;
  lastConnectionAttempt = millis();
  
  Serial.printf("[WiFi] Reconnection attempt %d/%d\n", connectionAttempts, MAX_ATTEMPTS);
  
  WiFi.disconnect(false);  // Keep stored credentials
  delay(100);
  WiFi.begin(ssid.c_str(), password.c_str());
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - startTime) < 10000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    connected = true;
    connectionAttempts = 0;
    Serial.println("\n[WiFi] Reconnected!");
    return true;
  } else {
    connected = false;
    if (connectionAttempts >= MAX_ATTEMPTS) {
      Serial.println("\n[WiFi] Max reconnection attempts reached");
      connectionAttempts = 0;  // Reset for next batch
    }
    return false;
  }
}

int8_t WiFiManager::getRSSI() {
  if (isConnected()) {
    return WiFi.RSSI();
  }
  return 0;
}

uint8_t WiFiManager::getAttempts() {
  return connectionAttempts;
}

void WiFiManager::setLowPowerMode() {
  Serial.println("[WiFi] Setting low power mode");
  WiFi.setTxPower(WIFI_POWER_8dBm);  // Reduce TX power
}

void WiFiManager::setHighPowerMode() {
  Serial.println("[WiFi] Setting high power mode");
  WiFi.setTxPower(WIFI_POWER_20dBm);  // Full power
}
