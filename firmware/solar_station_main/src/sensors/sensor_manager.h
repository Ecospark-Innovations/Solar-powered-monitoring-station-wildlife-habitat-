#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BME680.h>
#include "bme680_sensor.h"
#include "pm_sensor.h"
#include "uv_sensor.h"
#include "microphone_sensor.h"

class SensorManager {
private:
  BME680Sensor bme680;
  PMSensor pmSensor;
  UVSensor uvSensor;
  MicrophoneSensor microphone;
  
  // Sensor calibration offsets
  float tempOffset = 0.0;
  float humidityOffset = 0.0;
  
public:
  SensorManager();
  
  void begin();
  void update();
  
  // Environmental sensors
  float readTemperature();
  float readHumidity();
  float readPressure();
  float readVOC();
  float readAltitude();
  
  // Particulate matter
  float readPM25();
  float readPM10();
  
  // UV sensor
  float readUVIndex();
  float readUVA();
  float readUVB();
  
  // Audio/Acoustic
  uint16_t* recordAudio(uint32_t durationMs);
  float analyzeAcousticFrequency();
  
  // Calibration
  void calibrateTemperature(float referenceTemp);
  void calibrateHumidity(float referenceHumidity);
  
  // Status
  bool isBME680Healthy();
  bool isPMSensorHealthy();
  bool isUVSensorHealthy();
};

#endif // SENSOR_MANAGER_H
