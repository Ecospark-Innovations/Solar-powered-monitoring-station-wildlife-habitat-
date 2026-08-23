#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include "config.h"
#include "sensors/sensor_manager.h"
#include "power/power_manager.h"
#include "wifi/wifi_manager.h"
#include "camera/camera_manager.h"

// Global instances
SensorManager sensorManager;
PowerManager powerManager;
WiFiManager wifiManager;
CameraManager cameraManager;

unsigned long lastSensorUpdate = 0;
unsigned long lastCameraCapture = 0;
unsigned long lastDataUpload = 0;

// Sensor data structure
struct SensorData {
  float temperature;
  float humidity;
  float pressure;
  float voc;
  float pm25;
  float pm10;
  float uvIndex;
  float batteryVoltage;
  float solarVoltage;
  uint32_t timestamp;
  bool motionDetected;
};

SensorData currentData;

void setup() {
  Serial.begin(DEBUG_BAUD_RATE);
  delay(1000);
  
  Serial.println("\n\n=== Solar Wildlife Monitoring Station Booting ===");
  Serial.printf("Device ID: %s\n", DEVICE_ID);
  Serial.printf("API Endpoint: %s\n", API_ENDPOINT);
  
  // Initialize I2C
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("I2C initialized");
  
  // Initialize power management
  powerManager.begin();
  Serial.println("Power manager initialized");
  
  // Initialize sensors
  sensorManager.begin();
  Serial.println("Sensors initialized");
  
  // Initialize WiFi
  wifiManager.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("WiFi manager initialized");
  
  // Initialize camera (if available)
  #if CAMERA_ENABLED
  cameraManager.begin();
  Serial.println("Camera initialized");
  #endif
  
  // Set time from NTP
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("Time synchronized with NTP");
  
  Serial.println("=== System Ready ===");
  delay(2000);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Update sensor data at regular intervals
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    lastSensorUpdate = currentMillis;
    updateSensorData();
    
    if (DEBUG_ENABLED && LOG_TELEMETRY) {
      logTelemetry();
    }
  }
  
  // Capture camera image at regular intervals
  #if CAMERA_ENABLED
  if (currentMillis - lastCameraCapture >= CAMERA_CAPTURE_INTERVAL) {
    lastCameraCapture = currentMillis;
    captureCameraImage();
  }
  #endif
  
  // Upload data to cloud if WiFi connected
  if (wifiManager.isConnected() && currentMillis - lastDataUpload >= 120000) {
    lastDataUpload = currentMillis;
    uploadTelemetryData();
  }
  
  // Check power status and adjust operations
  powerManager.update();
  if (powerManager.getCriticalBattery()) {
    Serial.println("!!! Critical battery level - entering low power mode");
    enterLowPowerMode();
  }
  
  // Handle motion detection events
  checkMotionEvents();
  
  delay(1000);  // Main loop tick
}

void updateSensorData() {
  Serial.println("[SENSORS] Updating sensor data...");
  
  // Read environmental sensors
  currentData.temperature = sensorManager.readTemperature();
  currentData.humidity = sensorManager.readHumidity();
  currentData.pressure = sensorManager.readPressure();
  currentData.voc = sensorManager.readVOC();
  currentData.pm25 = sensorManager.readPM25();
  currentData.pm10 = sensorManager.readPM10();
  currentData.uvIndex = sensorManager.readUVIndex();
  
  // Read power metrics
  currentData.batteryVoltage = powerManager.getBatteryVoltage();
  currentData.solarVoltage = powerManager.getSolarVoltage();
  
  // Timestamp
  currentData.timestamp = time(nullptr);
  
  // Motion detection
  currentData.motionDetected = digitalRead(MOTION_SENSOR_PIN) == HIGH;
}

void uploadTelemetryData() {
  if (!wifiManager.isConnected()) {
    Serial.println("[UPLOAD] WiFi not connected - skipping upload");
    return;
  }
  
  Serial.println("[UPLOAD] Uploading telemetry data...");
  
  HTTPClient http;
  http.setConnectTimeout(5000);
  http.setTimeout(10000);
  
  String url = String(API_ENDPOINT) + API_TELEMETRY_PATH;
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = currentData.timestamp;
  doc["temperature"] = currentData.temperature;
  doc["humidity"] = currentData.humidity;
  doc["pressure"] = currentData.pressure;
  doc["voc"] = currentData.voc;
  doc["pm25"] = currentData.pm25;
  doc["pm10"] = currentData.pm10;
  doc["uv_index"] = currentData.uvIndex;
  doc["battery_voltage"] = currentData.batteryVoltage;
  doc["solar_voltage"] = currentData.solarVoltage;
  doc["motion_detected"] = currentData.motionDetected;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Send HTTP POST request
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);
  
  int httpCode = http.POST(jsonPayload);
  
  if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
    Serial.printf("[UPLOAD] Success (HTTP %d)\n", httpCode);
  } else {
    Serial.printf("[UPLOAD] Failed (HTTP %d)\n", httpCode);
    Serial.printf("[UPLOAD] Response: %s\n", http.getString().c_str());
  }
  
  http.end();
}

void captureCameraImage() {
  #if CAMERA_ENABLED
  Serial.println("[CAMERA] Capturing image...");
  
  uint8_t* imageData = cameraManager.captureImage();
  if (imageData != nullptr) {
    uploadCameraImage(imageData);
    free(imageData);
  } else {
    Serial.println("[CAMERA] Failed to capture image");
  }
  #endif
}

void uploadCameraImage(uint8_t* imageData) {
  if (!wifiManager.isConnected()) {
    Serial.println("[CAMERA] WiFi not connected - skipping upload");
    return;
  }
  
  Serial.println("[CAMERA] Uploading camera image...");
  
  HTTPClient http;
  String url = String(API_ENDPOINT) + "/api/camera/snapshot";
  
  http.begin(url);
  http.addHeader("Content-Type", "image/jpeg");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);
  http.addHeader("X-Device-ID", DEVICE_ID);
  http.addHeader("X-Timestamp", String(time(nullptr)));
  
  // Note: This is simplified. Real implementation would use POST with multipart form data
  // For production, use a proper image upload library
  
  http.end();
}

void checkMotionEvents() {
  static unsigned long lastMotionTime = 0;
  static bool lastMotionState = false;
  
  bool currentMotion = digitalRead(MOTION_SENSOR_PIN) == HIGH;
  
  if (currentMotion && !lastMotionState) {
    // Motion detected - trigger event
    if (millis() - lastMotionTime > MOTION_DEBOUNCE_TIME) {
      Serial.println("[EVENT] Motion detected!");
      logWildlifeEvent("motion_detected", currentData.timestamp);
      lastMotionTime = millis();
    }
  }
  
  lastMotionState = currentMotion;
}

void logWildlifeEvent(const char* eventType, uint32_t timestamp) {
  if (!wifiManager.isConnected()) {
    Serial.println("[EVENT] WiFi not connected - event will be queued");
    // TODO: Store in SPIFFS queue for later upload
    return;
  }
  
  HTTPClient http;
  String url = String(API_ENDPOINT) + API_EVENTS_PATH;
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["event_type"] = eventType;
  doc["timestamp"] = timestamp;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);
  
  int httpCode = http.POST(jsonPayload);
  Serial.printf("[EVENT] Logged event (HTTP %d)\n", httpCode);
  
  http.end();
}

void logTelemetry() {
  Serial.println("\n=== TELEMETRY DATA ===");
  Serial.printf("Temperature: %.2f°C\n", currentData.temperature);
  Serial.printf("Humidity: %.2f%%\n", currentData.humidity);
  Serial.printf("Pressure: %.2f hPa\n", currentData.pressure);
  Serial.printf("VOC: %.2f ppm\n", currentData.voc);
  Serial.printf("PM2.5: %.2f µg/m³\n", currentData.pm25);
  Serial.printf("PM10: %.2f µg/m³\n", currentData.pm10);
  Serial.printf("UV Index: %.2f\n", currentData.uvIndex);
  Serial.printf("Battery: %.2f V\n", currentData.batteryVoltage);
  Serial.printf("Solar: %.2f V\n", currentData.solarVoltage);
  Serial.printf("Motion: %s\n", currentData.motionDetected ? "YES" : "NO");
  Serial.println("======================");
}

void enterLowPowerMode() {
  Serial.println("[POWER] Entering low power mode");
  
  // Disable non-essential systems
  digitalWrite(STATUS_LED_PIN, LOW);
  
  // Increase sensor update interval
  // Disable camera
  // Reduce WiFi connection frequency
  
  Serial.println("[POWER] Low power mode active - will wake on solar charging");
}
