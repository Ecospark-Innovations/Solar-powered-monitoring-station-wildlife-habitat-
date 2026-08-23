#ifndef UV_SENSOR_H
#define UV_SENSOR_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_VEML6075.h>

class UVSensor {
private:
  Adafruit_VEML6075 uv;
  bool initialized = false;
  float uvIndex = 0.0;
  float uvA = 0.0;
  float uvB = 0.0;
  
public:
  UVSensor();
  bool begin();
  void update();
  
  float getUVIndex();
  float getUVA();
  float getUVB();
  
  bool isHealthy();
};

#endif // UV_SENSOR_H
