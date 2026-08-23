#ifndef POWER_MANAGER_H
#define POWER_MANAGER_H

#include <Arduino.h>

class PowerManager {
private:
  // ADC pins
  int batteryVoltagePin;
  int solarVoltagePin;
  int chargeControllerPin;
  
  // Battery state
  float batteryVoltage = 0.0;
  float solarVoltage = 0.0;
  float chargeControllerCurrent = 0.0;
  
  // Calibration
  float voltageCalibrationFactor = 1.0;
  float currentCalibrationFactor = 1.0;
  
  // State tracking
  bool criticalBattery = false;
  bool lowBattery = false;
  bool charging = false;
  
public:
  PowerManager();
  
  void begin();
  void update();
  
  // Voltage readings (with ADC scaling)
  float getBatteryVoltage();
  float getSolarVoltage();
  float getChargeControllerCurrent();
  
  // Battery state
  float getBatteryPercentage();
  bool isCriticalBattery();
  bool isLowBattery();
  bool isCharging();
  
  // Power management
  void enableHighPowerMode();
  void enableLowPowerMode();
  void enableUltraLowPowerMode();
  void enterDeepSleep(uint32_t sleepTimeUs);
  
  // Calibration
  void calibrateVoltage(float referenceVoltage);
  void calibrateCurrent(float referenceCurrent);
};

#endif // POWER_MANAGER_H
