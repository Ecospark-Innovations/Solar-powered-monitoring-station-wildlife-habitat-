#include "sensor_manager.h"
#include "../config.h"

SensorManager::SensorManager() : 
  bme680(), 
  pmSensor(), 
  uvSensor(), 
  microphone() {
}

void SensorManager::begin() {
  Serial.println("[SENSOR_MANAGER] Initializing sensors...");
  
  // Initialize BME680
  if (bme680.begin()) {
    Serial.println("  ✓ BME680 (Temp/Humidity/Pressure/VOC) initialized");
  } else {
    Serial.println("  ✗ BME680 failed to initialize");
  }
  
  // Initialize PM Sensor (SDS011 or similar)
  if (pmSensor.begin()) {
    Serial.println("  ✓ PM Sensor (SDS011) initialized");
  } else {
    Serial.println("  ✗ PM Sensor failed to initialize");
  }
  
  // Initialize UV Sensor (VEML6075)
  if (uvSensor.begin()) {
    Serial.println("  ✓ UV Sensor (VEML6075) initialized");
  } else {
    Serial.println("  ✗ UV Sensor failed to initialize");
  }
  
  // Initialize Microphone
  if (microphone.begin(AUDIO_SAMPLE_RATE, AUDIO_BUFFER_SIZE)) {
    Serial.println("  ✓ Microphone (INMP441) initialized");
  } else {
    Serial.println("  ✗ Microphone failed to initialize");
  }
  
  Serial.println("[SENSOR_MANAGER] Initialization complete");
}

void SensorManager::update() {
  bme680.update();
  pmSensor.update();
  uvSensor.update();
}

float SensorManager::readTemperature() {
  return bme680.getTemperature() + tempOffset;
}

float SensorManager::readHumidity() {
  return bme680.getHumidity() + humidityOffset;
}

float SensorManager::readPressure() {
  return bme680.getPressure();
}

float SensorManager::readVOC() {
  return bme680.getGasResistance();
}

float SensorManager::readAltitude() {
  return bme680.getAltitude();
}

float SensorManager::readPM25() {
  return pmSensor.getPM25();
}

float SensorManager::readPM10() {
  return pmSensor.getPM10();
}

float SensorManager::readUVIndex() {
  return uvSensor.getUVIndex();
}

float SensorManager::readUVA() {
  return uvSensor.getUVA();
}

float SensorManager::readUVB() {
  return uvSensor.getUVB();
}

uint16_t* SensorManager::recordAudio(uint32_t durationMs) {
  return microphone.record(durationMs);
}

float SensorManager::analyzeAcousticFrequency() {
  return microphone.analyzeFrequency();
}

void SensorManager::calibrateTemperature(float referenceTemp) {
  float currentTemp = bme680.getTemperature();
  tempOffset = referenceTemp - currentTemp;
  Serial.printf("[SENSOR] Temperature calibrated (offset: %.2f°C)\n", tempOffset);
}

void SensorManager::calibrateHumidity(float referenceHumidity) {
  float currentHumidity = bme680.getHumidity();
  humidityOffset = referenceHumidity - currentHumidity;
  Serial.printf("[SENSOR] Humidity calibrated (offset: %.2f%%)\n", humidityOffset);
}

bool SensorManager::isBME680Healthy() {
  return bme680.isHealthy();
}

bool SensorManager::isPMSensorHealthy() {
  return pmSensor.isHealthy();
}

bool SensorManager::isUVSensorHealthy() {
  return uvSensor.isHealthy();
}
