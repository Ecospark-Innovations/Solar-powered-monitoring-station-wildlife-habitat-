#include "power_manager.h"
#include "../config.h"

PowerManager::PowerManager() 
  : batteryVoltagePin(BATTERY_VOLTAGE_PIN),
    solarVoltagePin(SOLAR_VOLTAGE_PIN),
    chargeControllerPin(CHARGE_CONTROLLER_PIN) {
}

void PowerManager::begin() {
  Serial.println("[POWER] Initializing power management system...");
  
  // Configure ADC pins for input
  pinMode(batteryVoltagePin, INPUT);
  pinMode(solarVoltagePin, INPUT);
  pinMode(chargeControllerPin, INPUT);
  
  // Configure ADC for 12-bit resolution (0-4095)
  analogSetWidth(12);
  analogSetAttenuation(ADC_11db);  // 0-3.3V range
  
  // Read initial values
  update();
  
  Serial.println("[POWER] Power management initialized");
  Serial.printf("  Battery: %.2f V\n", batteryVoltage);
  Serial.printf("  Solar: %.2f V\n", solarVoltage);
}

void PowerManager::update() {
  // Read raw ADC values (12-bit: 0-4095)
  uint16_t batteryRaw = analogRead(batteryVoltagePin);
  uint16_t solarRaw = analogRead(solarVoltagePin);
  uint16_t currentRaw = analogRead(chargeControllerPin);
  
  // Convert to voltage: (raw / 4095) * 3.3V * scaling factor
  // For 60V battery: scaling factor = (60V / 3.3V) = 18.18
  // Voltage divider: R1=180k, R2=10k = 19x attenuation
  float scaleFactor = 19.0 * 3.3 / 4095.0;
  
  batteryVoltage = batteryRaw * scaleFactor * voltageCalibrationFactor;
  solarVoltage = solarRaw * scaleFactor * voltageCalibrationFactor;
  
  // Current sensing (e.g., ACS712-5A): 2.5V at 0A, 0.185V per A
  float currentVoltage = (currentRaw / 4095.0) * 3.3;
  chargeControllerCurrent = (currentVoltage - 2.5) / 0.185 * currentCalibrationFactor;
  
  // Update battery state
  charging = (chargeControllerCurrent > 0.5);
  criticalBattery = (batteryVoltage < CRITICAL_BATTERY);
  lowBattery = (batteryVoltage < MIN_BATTERY_VOLTAGE);
}

float PowerManager::getBatteryVoltage() {
  return batteryVoltage;
}

float PowerManager::getSolarVoltage() {
  return solarVoltage;
}

float PowerManager::getChargeControllerCurrent() {
  return chargeControllerCurrent;
}

float PowerManager::getBatteryPercentage() {
  // Map voltage to percentage for 4S LiFePO4 (48V nominal)
  // Min: 42V (0%), Max: 54.6V (100%)
  float percentage = ((batteryVoltage - CRITICAL_BATTERY) / 
                     (MAX_BATTERY_VOLTAGE - CRITICAL_BATTERY)) * 100.0;
  
  if (percentage < 0.0) percentage = 0.0;
  if (percentage > 100.0) percentage = 100.0;
  
  return percentage;
}

bool PowerManager::isCriticalBattery() {
  return criticalBattery;
}

bool PowerManager::isLowBattery() {
  return lowBattery;
}

bool PowerManager::isCharging() {
  return charging;
}

void PowerManager::enableHighPowerMode() {
  Serial.println("[POWER] Enabling high power mode");
  // Enable all sensors
  // Enable WiFi at full power
  // Enable camera
  // Enable LED indicators
}

void PowerManager::enableLowPowerMode() {
  Serial.println("[POWER] Entering low power mode");
  // Reduce WiFi transmission power
  // Increase sensor polling intervals
  // Disable unnecessary LEDs
  // Reduce camera resolution
}

void PowerManager::enableUltraLowPowerMode() {
  Serial.println("[POWER] Entering ultra-low power mode (critical battery)");
  // Disable WiFi except for critical uploads
  // Disable camera
  // Minimal sensor polling
  // Disable all non-essential systems
  // Prepare for deep sleep
}

void PowerManager::enterDeepSleep(uint32_t sleepTimeUs) {
  Serial.printf("[POWER] Entering deep sleep for %lu seconds\n", sleepTimeUs / 1000000);
  Serial.flush();
  
  // Configure wake sources
  esp_sleep_enable_timer_wakeup(sleepTimeUs);
  
  // Optional: Configure GPIO wake (e.g., motion sensor)
  // esp_sleep_enable_ext0_wakeup(GPIO_NUM_13, 1);
  
  // Enter deep sleep
  esp_deep_sleep_start();
}

void PowerManager::calibrateVoltage(float referenceVoltage) {
  float currentReading = getBatteryVoltage();
  voltageCalibrationFactor = referenceVoltage / currentReading;
  Serial.printf("[POWER] Voltage calibrated (factor: %.4f)\n", voltageCalibrationFactor);
}

void PowerManager::calibrateCurrent(float referenceCurrent) {
  float currentReading = getChargeControllerCurrent();
  currentCalibrationFactor = referenceCurrent / currentReading;
  Serial.printf("[POWER] Current calibrated (factor: %.4f)\n", currentCalibrationFactor);
}
