#include "bme680_sensor.h"
#include "../config.h"

BME680Sensor::BME680Sensor() {
}

bool BME680Sensor::begin() {
  if (!bme.begin(BME680_ADDRESS)) {
    Serial.println("Could not find a valid BME680 sensor");
    return false;
  }
  
  // Set up oversampling and filter initialization
  bme.setTemperatureOversampling(BME680_OS_8X);
  bme.setHumidityOversampling(BME680_OS_2X);
  bme.setPressureOversampling(BME680_OS_4X);
  bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
  bme.setGasHeater(320, 150); // 320°C for 150 ms
  
  initialized = true;
  endTime = bme.beginReading();
  return true;
}

void BME680Sensor::update() {
  if (!initialized) return;
  
  if (isReadingAvailable()) {
    if (!bme.endReading()) {
      Serial.println("Failed to complete reading");
      return;
    }
    endTime = bme.beginReading();
  }
}

float BME680Sensor::getTemperature() {
  return initialized ? bme.temperature : 0.0;
}

float BME680Sensor::getHumidity() {
  return initialized ? bme.humidity : 0.0;
}

float BME680Sensor::getPressure() {
  return initialized ? (bme.pressure / 100.0) : 0.0;  // Convert to hPa
}

float BME680Sensor::getGasResistance() {
  return initialized ? (bme.gas_resistance / 1000.0) : 0.0;  // Convert to kOhm
}

float BME680Sensor::getAltitude() {
  return initialized ? bme.readAltitude(1013.25) : 0.0;
}

bool BME680Sensor::isHealthy() {
  return initialized;
}

bool BME680Sensor::isReadingAvailable() {
  return initialized && millis() >= endTime;
}
