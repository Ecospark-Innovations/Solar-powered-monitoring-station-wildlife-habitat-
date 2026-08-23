#ifndef PM_SENSOR_H
#define PM_SENSOR_H

#include <Arduino.h>
#include <SoftwareSerial.h>

// SDS011 Protocol
#define SDS_RX_PIN 16
#define SDS_TX_PIN 17

class PMSensor {
private:
  SoftwareSerial sdsSerial;
  bool initialized = false;
  float pm25 = 0.0;
  float pm10 = 0.0;
  unsigned long lastRead = 0;
  uint8_t buffer[10];
  
public:
  PMSensor();
  bool begin();
  void update();
  
  float getPM25();
  float getPM10();
  
  bool readSDS011Data();
  void calculateChecksum(uint8_t* data);
  
  bool isHealthy();
};

#endif // PM_SENSOR_H
