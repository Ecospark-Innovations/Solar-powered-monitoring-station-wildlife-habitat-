#include "pm_sensor.h"

PMSensor::PMSensor() : sdsSerial(SDS_RX_PIN, SDS_TX_PIN) {
}

bool PMSensor::begin() {
  sdsSerial.begin(9600);
  Serial.println("PM Sensor (SDS011) initialized on Serial UART");
  initialized = true;
  return true;
}

void PMSensor::update() {
  if (!initialized) return;
  
  if (millis() - lastRead > 5000) {  // Read every 5 seconds
    readSDS011Data();
    lastRead = millis();
  }
}

bool PMSensor::readSDS011Data() {
  if (sdsSerial.available() >= 10) {
    // SDS011 protocol: AA + command + data(6) + checksum + AB
    uint8_t headerByte = sdsSerial.read();
    
    if (headerByte == 0xAA) {
      uint8_t commandByte = sdsSerial.read();
      
      if (commandByte == 0xC0) {  // Data report
        // Read data bytes
        for (int i = 0; i < 6; i++) {
          buffer[i] = sdsSerial.read();
        }
        uint8_t checksum = sdsSerial.read();
        uint8_t tailByte = sdsSerial.read();
        
        if (tailByte == 0xAB) {
          // Parse PM2.5 and PM10
          uint16_t pm25_raw = (buffer[0] + (buffer[1] << 8));
          uint16_t pm10_raw = (buffer[2] + (buffer[3] << 8));
          
          pm25 = pm25_raw / 10.0;  // Convert to µg/m³
          pm10 = pm10_raw / 10.0;
          
          return true;
        }
      }
    }
  }
  return false;
}

float PMSensor::getPM25() {
  return pm25;
}

float PMSensor::getPM10() {
  return pm10;
}

bool PMSensor::isHealthy() {
  return initialized && (millis() - lastRead < 30000);  // Healthy if data received within 30s
}
