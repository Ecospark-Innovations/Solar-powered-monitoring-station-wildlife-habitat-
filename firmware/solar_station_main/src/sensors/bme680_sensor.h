#ifndef BME680_SENSOR_H
#define BME680_SENSOR_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BME680.h>

class BME680Sensor {
private:
  Adafruit_BME680 bme;
  bool initialized = false;
  unsigned long lastRead = 0;
  uint32_t endTime = 0;
  
public:
  BME680Sensor();
  bool begin();
  void update();
  
  float getTemperature();
  float getHumidity();
  float getPressure();
  float getGasResistance();
  float getAltitude();
  
  bool isHealthy();
  bool isReadingAvailable();
};

#endif // BME680_SENSOR_H
