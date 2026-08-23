#include "uv_sensor.h"
#include "../config.h"

UVSensor::UVSensor() {
}

bool UVSensor::begin() {
  if (!uv.begin()) {
    Serial.println("Could not find a valid VEML6075 sensor");
    return false;
  }
  
  uv.setIntegrationTime(VEML6075_100MS);
  uv.setHighDynamic(false);
  uv.setForcedMode(false);
  
  initialized = true;
  return true;
}

void UVSensor::update() {
  if (!initialized) return;
  
  uvA = uv.readUVA();
  uvB = uv.readUVB();
  
  // Calculate UV Index (simplified formula)
  // Real calculation depends on sensor calibration
  uvIndex = (uvA + uvB) / 2.0 / 10.0;
}

float UVSensor::getUVIndex() {
  return uvIndex;
}

float UVSensor::getUVA() {
  return uvA;
}

float UVSensor::getUVB() {
  return uvB;
}

bool UVSensor::isHealthy() {
  return initialized;
}
